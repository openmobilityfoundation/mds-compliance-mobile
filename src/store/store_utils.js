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

// Generic functions for setting up redux domain when given an ACTIONS map of:
//  const ACTIONS = {
//    action1: {
//      creator(payload) {
//        return { type: "action1", payload }
//      },
//      handler(state, action) {
//        const { payload } = action;
//        return <...state modified with payload...>
//      },
//    action2: {
//      creator(param, param) {
//        return (dispatch, getState) => {
//          dispatch({ type: "normalActionDefinedElsewhere" });
//          dispatch(actions.actionCreatorFromElsewhere(param, param));
//          dispatch({ type: "action2" })
//        }
//      },
//      handler(state, action) {
//        // handle state change from `action2` action creator.
//    },
//    ...
//  }
import { connectRouter, routerMiddleware } from 'connected-react-router'
import forEach from 'lodash/forEach'
import merge from 'lodash/merge'
import { connect } from 'react-redux'
import { applyMiddleware, bindActionCreators, combineReducers, compose, createStore } from 'redux'
import thunk from 'redux-thunk'

// localStorage shim
import { getStoredValue, storeValue } from 'device/storage'

// Create store for the app given a `history` object (e.g. browser history).
// React-router will be set up as `router` domain.
// Automatically sets up `thunk` middleware.
export function createAppStore(reducers, history) {
  const rootReducer = combineReducers({
    router: connectRouter(history),
    ...reducers
  })
  // Set up Redux devtools if found
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
  return createStore(rootReducer, composeEnhancers(applyMiddleware(routerMiddleware(history), thunk)))
}

// Create a HOC to wrap a `Component` with the entire state `domain`
//  and `actions` passed in, e.g. in your redux domain file:
//
//  e.g.:
//    export function withMyDomain(Component) {
//      return connectComponent("myDomain", actions, Component)
//    }
export function connectComponent(domain, actions, Component) {
  return connect(
    state => {
      return domain ? { [domain]: state[domain] } : {}
    },
    dispatch => {
      return { actions: bindActionCreators(actions, dispatch) }
    }
  )(Component)
}

// Create a reducer function given an `ACTIONS` map and `INITIAL_STATE`.
// If `localStorageKey` is provided, we'll pull the current value from localStorage if present,
//  and persist the state in localStorage whenever it changes.
export function createReducer(ACTIONS, INITIAL_STATE, localStorageKey) {
  return function reducer(state, action) {
    // Get initial state from localStorage if not defined
    if (state === undefined) {
      const storedState = (localStorageKey && getStoredValue(localStorageKey)) || {}
      // eslint-disable-next-line no-param-reassign
      state = merge({}, INITIAL_STATE, storedState)
    }

    // Look up handler in ACTIONS list
    const handler = ACTIONS[action.type] && ACTIONS[action.type].handler
    // Forget it if handler is not defined.
    if (!handler) return state

    // Call handler and persist new state in localStorage
    const newState = handler(state, action)
    if (localStorageKey) storeValue(localStorageKey, newState)
    return newState
  }
}

// Return map of all action creators in ACTIONS map.
export function getActionCreators(ACTIONS) {
  // Get map of all action creators in ACTIONS
  const actions = {}
  forEach(ACTIONS, ({ creator }, actionName) => {
    if (creator) actions[actionName] = creator
  })
  return actions
}

// Return map of all handlers in ACTIONS map.
export function getHandlers(ACTIONS) {
  // Get map of all action handlers in ACTIONS
  const handlers = {}
  forEach(ACTIONS, ({ handler }, actionName) => {
    if (handler) handlers[actionName] = handler
  })
  return handlers
}
