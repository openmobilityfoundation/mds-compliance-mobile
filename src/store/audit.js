/* eslint-disable no-param-reassign */
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
// `audit` redux domain.
// ------------------------------------
import _ from 'lodash'
import getUUID from 'uuid/v4'
import { getConfigPaths } from 'config'
import { AUDIT_STATE, TELEMETRY_MODE, TELEMETRY_POLICY } from 'constants.js'
import device from 'device/index'
import { getProviderName } from 'util/providers'

import { connectComponent, createReducer, getActionCreators, getHandlers } from './store_utils'
import { actions as allActions } from './index'

const config = getConfigPaths({
  tripTelemetryTimerFrequency: 'apps.compliance.pages.audit.tripTelemetryTimerFrequency',
  tripTelemetryMode: 'apps.compliance.pages.audit.tripTelemetryMode'
})

// ------------------------------------
// Initial domain state
// ------------------------------------

// The audit data will be stored in `localStorage` and retrieved on app startup if defined.
const LOCAL_STORAGE_KEY = 'audit'

// HACK FOR TESTING:  Default provider values if not on production to walk through app flow faster.
const production = process.env.NODE_ENV === 'production'
// ------------------------------------
//  audit state data
// ------------------------------------
const INITIAL_AUDIT_STATE = {
  // "idle", "audit_start", "trip_start", "trip_end" etc
  state: AUDIT_STATE.idle,
  // string:  provider id for actual vehicle
  // On non-production deploy, defaults to `Test` provider for testing.
  providerId: production ? null : 'dc3dfcf1-ed9f-4606-9c3b-ef19027846ec', // HACK FOR TESTING
  // string:  provider name for actual vehicle
  // On non-production deploy, defaults to `Test` provider for testing.
  deviceProviderName: production ? null : 'Test',
  // string:  device vehicle id (from QR code, etc)
  // On non-production deploy, defaults to `test-device` provider for testing.
  providerVehicleId: production ? null : 'test-device',
  // UUID: `trip_id` for the audit trip, set on `startAudit`
  auditTripId: null,
  // timestamp:  when trip started
  tripStarted: null,
  // timestamp:  when trip ended
  tripEnded: null,
  // Have we logged an issue for this audit?
  issueLogged: false,
  // array: Log of audit events
  auditLog: []
}

// This will be overridden by value in localStorage if defined, see `reducer` below.
const INITIAL_STATE = {
  // ------------------------------------
  //  auditor/audit vehicle data -- not specific to a particular audit
  // ------------------------------------
  // Device id for "audit vehicle"
  // The server will auto-register this device if necessary.
  auditDeviceId: device.getUDID(),

  // ------------------------------------
  //  telemetry watching
  // ------------------------------------
  // Should use a `timer` to gather telemetry or respond to `location` changes?
  telemetryMode: config.tripTelemetryMode,
  // Interval id if we're watching telemetry data actively
  telemetryWatchId: null,

  // ------------------------------------
  //  audit state
  // ------------------------------------
  // Pull in audit state data (broken out so we can reset it in `resetAuditData()` below.
  ...INITIAL_AUDIT_STATE
}

// Actions for this reducer.  For each item in the map below:
//  - `creator(payload)` is the action creator.
//  - `handler(audit, action) is the action handler,
//     which will be called automatically when the corresponding action creator is called.
const ACTIONS = {
  // Reset app state completely (to `INITIAL_STATE`).
  // Really for debugging, we may leave this in the app as an escape hatch.
  resetAudit: {
    creator() {
      return dispatch => {
        dispatch(allActions.stopWatchingTelemetry())
        dispatch({ type: 'resetAudit' })
      }
    },
    handler() {
      return {
        ...INITIAL_STATE,
        auditLog: []
      }
    }
  },

  // Initialize app state on app load
  initAudit: {
    creator() {
      return (dispatch, getState) => {
        // Clear telemetry data to start
        dispatch({ type: 'initAudit' })

        // Re-start telemetry watching if trip has started
        const { state } = getState().audit
        if (state === AUDIT_STATE.trip_start) {
          dispatch(allActions.watchTelemetry())
        }
      }
    },
    handler(audit) {
      return {
        ...audit,

        // clear telemetry data
        lat: undefined,
        lng: undefined,
        telemetryWatchId: 0
      }
    }
  },

  // Reset app state on logout
  logout: {
    handler(state) {
      return handlers.resetAudit(state)
    }
  },

  // Reset audit data only.
  resetAuditData: {
    creator() {
      return { type: 'resetAuditData' }
    },
    handler(audit) {
      // Keep provider
      const { providerId, deviceProviderName } = audit
      // Stop watching telemetry in case we already have a watcher going
      audit = handlers.stopWatchingTelemetry(audit)
      return {
        ...audit,
        ...INITIAL_AUDIT_STATE,
        providerId,
        deviceProviderName,
        auditLog: []
      }
    }
  },

  // ------------------------------------
  //  generic input manipulation routines
  // ------------------------------------
  // Change a single value on the `audit` object.
  // Use in input onChange handlers:
  //  <IonInput value={audit.foo}
  //    onInput={(event) => actions.setAuditValue("foo", event.target.value)} />
  setAuditValue: {
    creator(fieldName, value) {
      return { type: 'setAuditValue', fieldName, value }
    },
    handler(audit, action) {
      const { fieldName, value } = action
      return {
        ...audit,
        [fieldName]: value
      }
    }
  },

  // Override the `audit` object with a map of values.
  setAuditValues: {
    creator(valueMap) {
      return { type: 'setAuditValues', valueMap }
    },
    handler(audit, action) {
      const { valueMap } = action
      return {
        ...audit,
        ...valueMap
      }
    }
  },

  // ------------------------------------
  //  audit state handlers
  // ------------------------------------
  // Start the audit process.
  // - If we're started from the form, we'll get device/vehicle from app state.
  // - If we're starting from the map, `deviceParams` will be passed in.
  startAudit: {
    creator(deviceParams = {}) {
      return dispatch => {
        // If coming in from the map, set device data first
        if (deviceParams && deviceParams.provider_id) {
          const { provider_id: providerId, vehicle_id: providerVehicleId } = deviceParams
          // Figure out `provider_name` from `provider_id`
          const deviceProviderName = getProviderName(providerId)
          dispatch({
            type: 'setAuditValues',
            valueMap: { providerId, providerVehicleId, deviceProviderName }
          })
        }

        dispatch({ type: 'startAudit' })
        dispatch(allActions._addAuditEvent(AUDIT_STATE.audit_start))
      }
    },
    handler(audit) {
      return {
        ...audit,
        state: AUDIT_STATE.audit_start,
        auditTripId: getUUID()
      }
    }
  },

  // Start the actual trip.
  startTrip: {
    creator() {
      return dispatch => {
        dispatch({ type: 'startTrip' })
        dispatch(allActions._addVehicleEvent(AUDIT_STATE.trip_start, "trip_start"))
        dispatch(allActions.watchTelemetry())
      }
    },
    handler(audit) {
      return {
        ...audit,
        state: AUDIT_STATE.trip_start,
        tripStarted: Date.now()
      }
    }
  },

  // `trip ended` button pressed.
  endTrip: {
    creator() {
      return dispatch => {
        dispatch(allActions.stopWatchingTelemetry())
        dispatch({ type: 'endTrip' })
        dispatch(allActions._addVehicleEvent(AUDIT_STATE.trip_end, "trip_end"))
      }
    },
    handler(audit) {
      return {
        ...audit,
        state: AUDIT_STATE.trip_end,
        tripEnded: Date.now()
      }
    }
  },
  // `complete audit` button pressed
  endAudit: {
    creator() {
      return dispatch => {
        dispatch(allActions._addAuditEvent(AUDIT_STATE.audit_end))
        dispatch({ type: 'endAudit' })
      }
    },
    handler(audit) {
      return {
        ...audit,
        state: AUDIT_STATE.audit_end
      }
    }
  },

  // `done` button pressed, resets back to start audit form
  completeAudit: {
    creator() {
      return { type: 'resetAuditData' }
    }
  },

  // Cancel the audit.
  // Only called if they haven't started the trip or logged an issue.
  cancelAudit: {
    creator() {
      return (dispatch, getState) => {
        const { auditTripId } = getState().audit
        dispatch(allActions.deleteReport(auditTripId))
        dispatch({ type: 'resetAuditData' })
      }
    }
  },

  // Create a non-interactive issue and submit it immediately
  createAuditIssue: {
    creator(issue, note) {
      return dispatch => {
        const params = { audit_issue_code: issue, note }
        dispatch(allActions._addAuditEvent(AUDIT_STATE.audit_issue, params))
        dispatch({ type: 'createAuditIssue' })
      }
    },
    handler(audit) {
      return {
        ...audit,
        issueLogged: true
      }
    }
  },

  // Add an audit event to the event queue.
  // `eventType` is `audit_start` etc.
  _addAuditEvent: {
    creator(eventType, params = {}) {
      return (dispatch, getState) => {
        const { audit } = getState()
        const event = {
          type: eventType,
          telemetryPolicy: TELEMETRY_POLICY.optional,
          params: { ...params }
        }

        // Add additional props for `audit_start` event
        switch (eventType) {
          case AUDIT_STATE.audit_start:
            event.params.provider_id = audit.providerId
            event.params.provider_vehicle_id = audit.providerVehicleId
            event.params.audit_device_id = audit.auditDeviceId
            break

          case AUDIT_STATE.audit_end:
            break

          case AUDIT_STATE.audit_issue:
            event.params.audit_event_type = 'issue'
            break

          default:
            throw new TypeError(`Don't know how to add audit event type ${eventType}`)
        }
        return dispatch(allActions._addToAuditLog(event))
      }
    }
  },

  // Add a vehicle event to the event queue.
  // `eventType` is `trip_start` etc.
  _addVehicleEvent: {
    creator(auditEventType, vehicleEventType) {
      return (dispatch, getState) => {
        const { audit } = getState()
        const event = {
          type: auditEventType,
          telemetryPolicy: TELEMETRY_POLICY.optional,
          deviceId: audit.auditDeviceId,
          params: {
            event_type: vehicleEventType,
            trip_id: audit.auditTripId
          }
        }
        return dispatch(allActions._addToAuditLog(event))
      }
    }
  },

  // Add an event to the audit log and automatically enqueue it.
  // Automatically creates event id, etc.
  // Telemetry data will be added automatically if not present in `event.params`.
  _addToAuditLog: {
    creator(event) {
      if (!event.type) throw new TypeError('_addToAuditLog(): you must pass event.type')
      // clone event so we can muck with it and make sure we have params
      event = {
        ...event,
        params: { ...event.params }
      }
      return (dispatch, getState) => {
        const { audit } = getState()
        // UUID for the event we'll use to communicate with eventQueue and server
        const eventId = getUUID()

        // Add standard event / params data
        event.auditTripId = audit.auditTripId
        event.eventId = eventId
        event.params.audit_event_id = eventId

        // Timestamp when we logged the event.
        event.params.timestamp = Date.now()

        // Add to the audit log immediately (before telemetry comes in)
        dispatch({ type: '_addToAuditLog', event })
        dispatch(allActions.enqueueEvent(event))
      }
    },
    handler(audit, action) {
      const { auditLog } = audit
      const { event } = action
      return {
        ...audit,
        auditLog: [...auditLog, event]
      }
    }
  },

  // ------------------------------------
  // Telemetry events
  // ------------------------------------

  // Send a single telemetry event to the server.
  // If you already know the `telemetry`, pass it and we'll use it
  // Otherwise the eventQueue will add it.
  sendTelemetry: {
    creator(telemetry) {
      return dispatch => {
        const event = {
          type: AUDIT_STATE.telemetry,
          telemetry,
          telemetryPolicy: TELEMETRY_POLICY.required
        }
        dispatch(actions._addToAuditLog(event))
      }
    }
  },

  // Start watching telemetry
  watchTelemetry: {
    // `frequency` is in milliseconds
    creator(frequency = config.tripTelemetryTimerFrequency) {
      return (dispatch, getState) => {
        const { audit } = getState()

        // Stop watching telemetry in case we already have a watcher going
        handlers.stopWatchingTelemetry(audit)

        let telemetryWatchId
        if (audit.telemetryMode === TELEMETRY_MODE.timer) {
          // Get telemetry initially (it seems wierd that it doesn't happen right away)
          dispatch(actions.sendTelemetry())

          const callback = () => dispatch(actions.sendTelemetry())
          // Start timer with frequency as defined
          telemetryWatchId = setInterval(callback, frequency)
        } else {
          const callback = telemetry => dispatch(actions.sendTelemetry(telemetry))
          // eslint-disable-next-line no-console
          const errback = error => console.error('Error watching telemetry', error)
          telemetryWatchId = device.watchTelemetry(callback, errback)
        }

        return dispatch({ type: 'watchTelemetry', telemetryWatchId })
      }
    },
    handler(audit, action) {
      return {
        ...audit,
        telemetryWatchId: action.telemetryWatchId
      }
    }
  },

  stopWatchingTelemetry: {
    creator() {
      return { type: 'stopWatchingTelemetry' }
    },
    handler(audit) {
      // Clear existing timer if defined
      const { telemetryMode, telemetryWatchId } = audit
      if (telemetryWatchId == null) return audit

      if (telemetryMode === TELEMETRY_MODE.timer) {
        clearInterval(telemetryWatchId)
      } else {
        device.stopWatchingTelemetry(telemetryWatchId)
      }
      return {
        ...audit,
        telemetryWatchId: null
      }
    }
  },

  setTelemetryMode: {
    creator(telemetryMode) {
      return { type: 'setTelemetryMode', telemetryMode }
    },
    handler(audit, { telemetryMode }) {
      return {
        ...audit,
        telemetryMode
      }
    }
  },

  // ------------------------------------
  // Watch update events from `eventQueue` domain to update `auditLog` events as necessary
  // ------------------------------------

  // Generic handler to update audit event params by merging with `deltas`.
  updateEvent: {
    handler(audit, action) {
      const { auditLog } = audit
      const { eventId, deltas } = action
      return {
        ...audit,
        auditLog: auditLog.map(event => {
          if (event.eventId !== eventId) return event
          return _.merge(event, deltas)
        })
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

// Export a simple HOC which just outputs the entire app state as `props.audit`
// and bound action creators as `props.actions`.
export function withAudit(Component) {
  return connectComponent('audit', allActions, Component)
}
