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
// `auth` redux domain.
// NOTE: the presence of `compliance` in `config` below makes this file app-specific!
// ------------------------------------
import { getConfigPaths } from 'config'
import auth0 from 'services/auth0'
import { push } from 'connected-react-router'

import { createReducer, getActionCreators, connectComponent } from './store_utils'
import { actions as allActions } from './index'

const config = getConfigPaths({
  appUrl: 'apps.compliance.app.url',
  auth0ClientId: 'authentication.auth0.clientId'
})

// ------------------------------------
// Initial domain state
// ------------------------------------

// The auth data will be stored in `localStorage` and retrieved on app startup if defined.
const LOCAL_STORAGE_KEY = 'auth'

// This will be overridden by value in localStorage if defined, see `reducer` below.
const INITIAL_STATE = {
  accessToken: null,
  idToken: null,
  expiresAt: null,
  profile: null
}

// Actions for this reducer.  For each item in the map below:
//  - `creator(payload)` is the action creator.
//  - `handler(state, action) is the action handler,
//     Which will be called automatically when the corresponding action creator is called.
const ACTIONS = {
  saveAuth: {
    creator(authState) {
      return dispatch => {
        dispatch({ type: 'saveAuth', authState })
        dispatch(push('/'))
      }
    },
    handler(state, { authState }) {
      return {
        ...state,
        ...authState
      }
    }
  },
  failAuth: {
    creator() {
      return dispatch => {
        dispatch({ type: 'failAuth' })
      }
    },
    handler() {
      // clear auth state
      return {
        ...INITIAL_STATE
      }
    }
  },
  logout: {
    creator() {
      return dispatch => {
        // clear localStorage (also used by other domains to clear themselves)
        dispatch({ type: 'logout' })
        // Actually log out
        auth0.logout({
          clientID: config.auth0ClientId,
          returnTo: config.appUrl
        })
      }
    },
    handler() {
      // clear auth state
      return {
        ...INITIAL_STATE
      }
    }
  }
} // end ACTIONS

// ------------------------------------
// Action Creators
// ------------------------------------
// Extract map of action creators from the above.
// NOTE: this map is not available until this file fully executes,
// You MUST load it from `index.js` instead of this file.
export const actions = getActionCreators(ACTIONS)

// ------------------------------------
// Reducer
// ------------------------------------
export const reducer = createReducer(ACTIONS, INITIAL_STATE, LOCAL_STORAGE_KEY)

// ------------------------------------
// HOCs
// ------------------------------------

// Export a simple HOC which just outputs the entire auth state as `props.auth`
// and bound action creators as `props.actions`.
export function withAuth(Component) {
  return connectComponent('auth', allActions, Component)
}
