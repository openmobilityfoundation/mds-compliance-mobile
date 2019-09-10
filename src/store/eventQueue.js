/* eslint-disable no-use-before-define */
/*
    Copyright 2019 City of Los Angeles.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

// ------------------------------------
// `eventQueue` redux domain.
// ------------------------------------
import _ from 'lodash'

import { getConfigPaths } from 'config'
import { TELEMETRY_POLICY, QUEUE_STATE } from 'constants.js'
import device from 'device'

import { NETWORK_ERROR_STATUS } from 'services/api_utils'
import { connectComponent, createReducer, getActionCreators, getHandlers } from './store_utils'
import { actions as allActions } from './index'

const config = getConfigPaths({
  offlineCheckFrequency: 'apps.compliance.api.offlineCheckFrequency'
})

// ------------------------------------
// API Handler registry
// Call `addEventApiHandler(<eventType>, <handler>)` to register handler methods
//  for specific `event.type`s.  `handler()` is your fetch call.
// ------------------------------------

const API_HANDLER_REGISTRY = {}
export function addEventApiHandler(eventType, handler) {
  if (!eventType)
    throw new TypeError('eventQueue.addEventApiHandler(): undefined eventType.  Did you mis-type the constant?')
  if (!handler)
    throw new TypeError('eventQueue.addEventApiHandler(): undefined handler.  Did you mis-type the method name?')
  API_HANDLER_REGISTRY[eventType] = handler
}

// ------------------------------------
// Initial domain state
// ------------------------------------

// The eventQueue data will be stored in `localStorage` and retrieved on app startup if defined.
const LOCAL_STORAGE_KEY = 'eventQueue'

// This will be overridden by value in localStorage if defined, see `reducer` below.
const INITIAL_STATE = {
  // `event.id` that we're currently attempting to send to the server
  inFlightEvent: null,

  // Queue of events which need to be sent.
  // NOTE: this needs to be reset manually, e.g. use `resetEventQueue`
  queue: [],

  // Do we currently think we're offline?
  offline: undefined,

  // Interval id for offline timer if we're offline
  offlineTimer: undefined
}

// Actions for this reducer.  For each item in the map below:
//  - `creator(payload)` is the action creator.
//  - `handler(state, action) is the action handler,
//     Which will be called automatically when the corresponding action creator is called.
const ACTIONS = {
  // Initialize the event queue on app load
  initEventQueue: {
    creator() {
      return dispatch => {
        dispatch({ type: 'initEventQueue' })
        // If app started offline, start timer which checks offline status periodically
        if (device.isOffline()) {
          dispatch(actions.enterOfflineMode())
        }
        // Otherwise start flushing any events in the queue
        else {
          dispatch(actions.checkEventQueue())
        }
      }
    },
    handler(state) {
      // Update state as it comes back from localStorage
      return {
        ...state,
        // Clear the `inFlightEvent` if it's set so we'll try to send that event again.
        inFlightEvent: null,
        // Assume that we start out online
        offline: false,
        // Clear the offlineTimer
        offlineTimer: undefined
      }
    }
  },

  // Reset the eventQueue (debug)
  resetEventQueue: {
    creator() {
      return { type: 'resetEventQueue' }
    },
    handler(state) {
      return {
        ...state,
        ...INITIAL_STATE,
        queue: []
      }
    }
  },

  // Reset app state on logout
  logout: {
    handler(state) {
      return handlers.resetEventQueue(state)
    }
  },

  // Enqueue an `event` to be sent to the server.
  enqueueEvent: {
    creator(event) {
      if (!event.type) throw new TypeError('enqueueEvent(): you must pass event.type')
      if (!event.params) throw new TypeError('enqueueEvent(): you must pass event.params')
      // clone the event so we can muck with it
      const clone = { ...event }
      return async dispatch => {
        const { eventId, telemetryPolicy = TELEMETRY_POLICY.none } = clone

        // If need telemetry and we don't already have it
        if (telemetryPolicy !== TELEMETRY_POLICY.none && !clone.params.telemetry) {
          // tell observers that we're awaiting telemetry
          dispatch(actions.updateEvent(eventId, { status: QUEUE_STATE.telemetry }))
          try {
            clone.params.telemetry = await device.getTelemetry()
          } catch (error) {
            // eslint-disable-next-line no-console
            console.warn('Error getting telemetry for event', clone)
            if (telemetryPolicy === TELEMETRY_POLICY.required) {
              dispatch(actions.updateEvent(eventId, { status: QUEUE_STATE.skipped, error }))
              return
            }
            clone.telemetry = null
          }
        }
        clone.status = QUEUE_STATE.ready
        dispatch(actions.updateEvent(eventId, clone))
        dispatch({ type: 'enqueueEvent', event: clone })
        dispatch(actions.checkEventQueue())
      }
    },
    handler(eventQueue, action) {
      let { event } = action
      event = { ...event, status: QUEUE_STATE.ready }
      return {
        ...eventQueue,
        queue: [...eventQueue.queue, event]
      }
    }
  },

  // Dispatch next event if necessary.
  checkEventQueue: {
    creator() {
      return (dispatch, getState) => {
        const { offline, inFlightEvent, queue } = getState().eventQueue
        if (offline || inFlightEvent || queue.length === 0) return undefined
        return dispatch(actions.dispatchEvent(queue[0].eventId))
      }
    }
  },

  // Dispatch an event specified by `event.eventId` to the server.
  dispatchEvent: {
    creator(eventId) {
      return (dispatch, getState) => {
        const { auth, eventQueue } = getState()
        const { accessToken } = auth
        const { queue } = eventQueue
        const event = queue.find(e => e.eventId === eventId)
        if (!event) throw new TypeError(`eventQueue.dispatchEvent(): can't find event ${eventId}`)

        // update the inFlightEvent
        dispatch({ type: 'dispatchEvent', eventId })
        dispatch(allActions.updateEvent(eventId, { status: QUEUE_STATE.in_flight }))

        // Find the apiHandler in the API_HANDLER_REGISTRY
        const apiHandler = API_HANDLER_REGISTRY[event.type]
        if (!apiHandler) {
          const error = `eventQueue.dispatchEvent(): Can't find apiHandler for event type '${event.type}'`
          return dispatch(allActions.eventDispatchError(eventId, error))
        }

        // Make the call, then dispatch `eventDispatched` or `eventDispatchError` when it finishes
        return apiHandler(event, accessToken)
          .then(result => dispatch(allActions.eventDispatched(eventId, result)))
          .catch(error => {
            // If we got a network status error, go offline
            // this will attempt to re-send this event when we go back online
            if (error.status === NETWORK_ERROR_STATUS) {
              dispatch(actions.enterOfflineMode())
            } else {
              dispatch(allActions.eventDispatchError(eventId, error))
            }
          })
      }
    },
    // Handler just updates the inFlightEvent
    handler(eventQueue, action) {
      const { eventId } = action
      return {
        ...eventQueue,
        inFlightEvent: eventId
      }
    }
  },

  // Successfully dispatched specified by `eventId` with `result`.
  eventDispatched: {
    creator(eventId, result) {
      return dispatch => {
        dispatch(allActions.updateEvent(eventId, { status: QUEUE_STATE.submitted, result }))
        dispatch({ type: 'eventDispatched', eventId, result })
        dispatch(allActions.checkEventQueue())
      }
    },
    handler(eventQueue, action) {
      const { eventId } = action
      return {
        ...eventQueue,
        inFlightEvent: null,
        // remove from eventQueue
        queue: eventQueue.queue.filter(event => event.eventId !== eventId)
      }
    }
  },

  // Error dispatching event specified by `eventId` with `error`.
  // NOTE: NOT called for a network error, only server error such as `500` or `404`.
  eventDispatchError: {
    creator(eventId, error) {
      return dispatch => {
        // If we got a network status error, go offline
        // this will attempt to re-send this event when we go back online
        if (error.status === NETWORK_ERROR_STATUS) {
          dispatch(actions.enterOfflineMode())
        }
        // A server error, record the error in the event and move on.  :-(
        // Note that this might, e.g. mess up an audit, especially if audit_start fails.
        else {
          dispatch(actions.updateEvent(eventId, { status: QUEUE_STATE.error, error }))
          dispatch({ type: 'eventDispatchError', eventId, error })
          dispatch(allActions.checkEventQueue())
        }
      }
    },
    handler(eventQueue, action) {
      const { eventId } = action
      return {
        ...eventQueue,
        inFlightEvent: null,
        // remove from eventQueue
        queue: eventQueue.queue.filter(event => event.eventId !== eventId)
      }
    }
  },

  // Generic handler to update an event in the event queue by merging with `deltas`.
  updateEvent: {
    creator(eventId, deltas) {
      return { type: 'updateEvent', eventId, deltas }
    },
    handler(eventQueue, action) {
      const { eventId, deltas } = action
      return {
        ...eventQueue,
        queue: eventQueue.queue.map(event => {
          if (event.eventId !== eventId) return event
          return _.merge(event, deltas)
        })
      }
    }
  },

  // ------------------------------------
  // Online/offline mode
  // ------------------------------------

  // Enter offlineMode -- called when `fetch` indicates the network is offline.
  enterOfflineMode: {
    creator() {
      return (dispatch, getState) => {
        // If there is an event in flight, reset it to `ready` status
        const { inFlightEvent } = getState().eventQueue
        if (inFlightEvent) {
          dispatch(actions.updateEvent(inFlightEvent, { status: QUEUE_STATE.ready }))
        }
        dispatch({ type: 'enterOfflineMode' })
        dispatch(actions.startOfflineTimer())
      }
    },
    handler(state) {
      return {
        ...state,
        // clear inFlightEvent so we'll try it again later
        inFlightEvent: null,
        // note that we think we're offline
        offline: true
      }
    }
  },

  // Check to see if the browser is online.
  // If so, we'll `exitOfflineMode`, which re-starts the event queue.
  checkOnlineStatus: {
    creator() {
      return dispatch => {
        const offline = device.isOffline()
        if (offline) {
          // dispatch 'stillOffline' event for debugging
          return dispatch({ type: 'stillOffline' })
        }
        return dispatch(actions.exitOfflineMode())
      }
    }
  },

  // Exit offline mode when we think we're back online.
  // Will restart the eventQueue.
  exitOfflineMode: {
    creator() {
      return dispatch => {
        dispatch(actions.stopOfflineTimer())
        dispatch({ type: 'exitOfflineMode' })
        dispatch(actions.checkEventQueue())
      }
    },
    handler(state) {
      return {
        ...state,
        offline: false
      }
    }
  },

  // Start timer which calls `checkOnlineStatus` every once in a while.
  startOfflineTimer: {
    creator() {
      return dispatch => {
        // stop current timer if necessary
        dispatch(actions.stopOfflineTimer())
        const offlineTimer = setInterval(() => dispatch(actions.checkOnlineStatus()), config.offlineCheckFrequency)
        dispatch({ type: 'startOfflineTimer', offlineTimer })
      }
    },
    handler(state, { offlineTimer }) {
      return {
        ...state,
        offlineTimer
      }
    }
  },

  // Stop timer which calls `checkOnlineStatus` every once in a while.
  stopOfflineTimer: {
    creator() {
      return (dispatch, getState) => {
        const { offlineTimer } = getState().eventQueue
        if (offlineTimer) clearInterval(offlineTimer)
        dispatch({ type: 'stopOfflineTimer' })
      }
    },
    handler(state) {
      return {
        ...state,
        offlineTimer: undefined
      }
    }
  }
} // end ACTIONS

// ------------------------------------
// Action Creators and handlers
// ------------------------------------
// Extract map of action creators and handlers from the above.
// NOTE: this map is not available until this file fully executes,
// You MUST load it from `index.js` instead of this file.
export const actions = getActionCreators(ACTIONS)
export const handlers = getHandlers(ACTIONS)

// ------------------------------------
// Reducer
// ------------------------------------
export const reducer = createReducer(ACTIONS, INITIAL_STATE, LOCAL_STORAGE_KEY)

// ------------------------------------
// HOCs
// ------------------------------------

// Export a simple HOC which just outputs the entire event queue state as `props.eventQueue`
// and ALL bound action creators as `props.actions`.
export function withEventQueue(Component) {
  return connectComponent('eventQueue', allActions, Component)
}
