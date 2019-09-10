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
// `reports` redux domain.
// ------------------------------------

import AuditReport from 'models/AuditReport'

import { LOAD_STATE } from 'constants.js'
import { getAuditReportList, getAuditReport, deleteAuditReport } from 'services/api'
import { connectComponent, createReducer, getActionCreators, getHandlers } from './store_utils'
import { actions as allActions } from './index'

// ------------------------------------
// Initial domain state
// ------------------------------------

const INITIAL_LIST_QUERY_PARAMS = {
  skip: null,
  take: 1000,
  provider_id: null,
  provider_vehicle_id: null,
  audit_subject_id: null,
  audit_start: null,
  audit_end: null
}

const INITIAL_STATE = {
  // List of audits.
  // Use `loadAuditReportList()` to load
  list: undefined,
  listError: undefined,
  listState: LOAD_STATE.unloaded,

  // list query params
  listFilter: { ...INITIAL_LIST_QUERY_PARAMS },

  // Map of audit records as `{ auditTripId: <raw audit record> }`
  reports: {}
}

// Actions for this reducer.  For each item in the map below:
//  - `creator(payload)` is the action creator.
//  - `handler(state, action) is the action handler,
//     Which will be called automatically when the corresponding action creator is called.
const ACTIONS = {
  // Update list filter params from form.
  // This will automatically trigger a reload of the `reports` list if it is visible.
  setListFilterParams: {
    creator(params) {
      return dispatch => {
        dispatch({ type: 'setListFilterParams', params })
      }
    },
    handler(state, { params }) {
      return {
        ...state,
        listFilter: {
          ...state.listFilter,
          ...params
        }
      }
    }
  },

  // Reset list query filter.
  // This will automatically trigger a reload of the `reports` list if it is visible.
  resetListFilter: {
    creator() {
      return dispatch => {
        return dispatch(allActions.setListFilterParams(INITIAL_LIST_QUERY_PARAMS))
      }
    }
  },

  // Load list of audit data.
  loadAuditReportList: {
    creator() {
      return (dispatch, getState) => {
        const { reports, auth } = getState()
        const { listFilter } = reports

        // Set loading state first
        dispatch({
          type: 'loadAuditReportList',
          listState: LOAD_STATE.loading,
          listError: null,
          list: undefined
        })

        return getAuditReportList(auth.accessToken, listFilter)
          .then(result =>
            dispatch({
              type: 'loadAuditReportList',
              listState: LOAD_STATE.loaded,
              listError: null,
              list: result.audits
            })
          )
          .catch(error =>
            dispatch({
              type: 'loadAuditReportList',
              listState: LOAD_STATE.error,
              listError: error,
              list: undefined
            })
          )
      }
    },
    // Handler is called when loading, after load and on load error
    handler(state, { listState, listError, list }) {
      return {
        ...state,
        listState,
        listError,
        list
      }
    }
  },

  // Load a particular audit report.
  // Pass `true` to `forceReload` to reload if necessary.
  // No effect if already loaded/loading.
  loadReport: {
    creator(auditTripId, forceReload = false) {
      return (dispatch, getState) => {
        const { reports, auth } = getState()
        if (!auditTripId) return
        if (!forceReload && reports.reports[auditTripId] !== LOAD_STATE.unloaded) return

        // set loading state first
        dispatch({ type: 'loadReport', auditTripId, report: LOAD_STATE.loading })

        // eslint-disable-next-line consistent-return
        return getAuditReport(auditTripId, auth.accessToken)
          .then(rawReport => {
            try {
              const report = new AuditReport(rawReport)
              dispatch({ type: 'loadReport', auditTripId, report })
            } catch (e) {
              // eslint-disable-next-line no-console
              console.error('Error parsing report:', e)
              throw e
            }
          })
          .catch(error =>
            dispatch({
              type: 'loadReport',
              auditTripId,
              report: LOAD_STATE.error,
              error
            })
          )
      }
    },
    // Handler is called when loading, after load and on load error
    handler(state, { auditTripId, report }) {
      return {
        ...state,
        reports: {
          ...state.reports,
          [auditTripId]: report
        }
      }
    }
  },

  // Delete a report
  deleteReport: {
    creator(auditTripId) {
      return (dispatch, getState) => {
        const { auth } = getState()
        // Start the delete but don't wait for it
        deleteAuditReport(auditTripId, auth.accessToken)
          // eslint-disable-next-line no-console
          .then(result => console.info('Deleted report', result))
          // eslint-disable-next-line no-console
          .catch(error => console.error('Error deleting report:', error))

        // Remove from the client
        dispatch({ type: 'deleteReport', auditTripId })
      }
    },
    handler(state, { auditTripId }) {
      let { list, reports } = state
      if (Array.isArray(list)) {
        list = list.filter(report => report.audit_trip_id !== auditTripId)
      }
      reports = { ...state.reports }
      delete reports[auditTripId]
      return {
        ...state,
        list,
        reports
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
export const reducer = createReducer(ACTIONS, INITIAL_STATE)

// ------------------------------------
// HOCs
// ------------------------------------

// Export a simple HOC which just outputs the entire app state as `props.reports`
// and bound action creators as `props.actions`.
export function withReports(Component) {
  return connectComponent('reports', allActions, Component)
}
