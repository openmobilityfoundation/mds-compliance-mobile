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
// `page` redux domain -- use for switching between pages.
// Also stores page-specific settings.
// ------------------------------------

import { push } from 'connected-react-router'

import { REPORT_DETAILS_PAGE } from 'constants.js'
import { connectComponent, createReducer, getActionCreators, getHandlers } from './store_utils'
import { actions as allActions } from './index'

// ------------------------------------
// Initial domain state
// ------------------------------------

// The audit data will be stored in `localStorage` and retrieved on app startup if defined.
const LOCAL_STORAGE_KEY = 'page'

// This will be overridden by value in localStorage if defined, see `reducer` below.
const INITIAL_STATE = {
  // ------------------------------------
  //  map page settings
  // ------------------------------------
  // Restrict map to a single provider
  mapProviderId: null,

  // ------------------------------------
  //  reports page settings
  // ------------------------------------
  // Details page being shown in the reports page.
  reportDetailsPage: REPORT_DETAILS_PAGE.graph
}

// Actions for this reducer.  For each item in the map below:
//  - `creator(payload)` is the action creator.
//  - `handler(audit, action) is the action handler,
//     Which will be called automatically when the corresponding action creator is called.
const ACTIONS = {
  // Show the audits page
  showAudits: {
    creator() {
      return allActions._showPage('/')
    }
  },

  // Show the list of audit reports.
  showReports: {
    creator() {
      return allActions._showPage('/reports')
    }
  },

  // Show one particular audit report.
  showReport: {
    creator(auditTripId) {
      return allActions._showPage(`/report/${auditTripId}`)
    }
  },

  // Generic action to show some page specified by URL
  // NOTE: don't call this directly, define an action handler to do it for you like the above.
  _showPage: {
    creator(url) {
      return dispatch => {
        dispatch(push(url))
        dispatch({ type: '_showPage' })
      }
    },
    handler(state) {
      return {
        ...state
      }
    }
  },

  // ------------------------------------
  //  map page settings
  // ------------------------------------

  // Restrict map to a single `providerId`.
  // Pass `null` to show all providers.
  setMapProviderId: {
    creator(providerId) {
      return dispatch => {
        dispatch({ type: 'setMapProviderId', providerId })
      }
    },
    handler(state, { providerId }) {
      return {
        ...state,
        mapProviderId: providerId
      }
    }
  },

  // ------------------------------------
  //  reports page settings
  // ------------------------------------

  // Set which details page we're showing in the report
  showReportDetailsPage: {
    creator(page) {
      return { type: 'showReportDetailsPage', page }
    },
    handler(state, { page }) {
      return {
        ...state,
        reportDetailsPage: page
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

// Export a simple HOC which just outputs the entire app state as `props.page`
// and bound action creators as `props.actions`.
export function withPage(Component) {
  return connectComponent('page', allActions, Component)
}
