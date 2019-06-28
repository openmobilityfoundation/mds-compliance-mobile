/* eslint-disable import/no-duplicates */
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

// Force load order for files in this folder.
// You MUST ONLY import from this file, including within this folder!!!!
import { createBrowserHistory } from 'history'
import { bindActionCreators } from 'redux'

import { AUDIT_STATE } from 'constants.js'

import { sendAuditEvent, sendVehicleEvent, sendTelemetryEvent } from 'services/api'
import { addEventApiHandler } from './eventQueue'
import { createAppStore } from './store_utils'

// Import actions/reducer for each domain.
import { actions as auditActions, reducer as auditReducer } from './audit'
import { actions as authActions, reducer as authReducer } from './auth'
import { actions as eventQueueActions, reducer as eventQueueReducer } from './eventQueue'
import { actions as pageActions, reducer as pageReducer } from './page'
import { actions as reportsActions, reducer as reportsReducer } from './reports'

// Export actions from all domains as a single map.
export const actions = {
  ...auditActions,
  ...authActions,
  ...eventQueueActions,
  ...pageActions,
  ...reportsActions
}

// Export reducers from all domains as a map of `{ domain: reducer() }`
export const reducers = {
  audit: auditReducer,
  auth: authReducer,
  eventQueue: eventQueueReducer,
  page: pageReducer,
  reports: reportsReducer
}

// Re-export HOCs from redux domain files.
export { withAudit } from './audit'
export { withAuth } from './auth'
export { withEventQueue } from './eventQueue'
export { withPage } from './page'
export { withReports } from './reports'

// ------------------------------------
// Set up API routines for audit events
// ------------------------------------
addEventApiHandler(AUDIT_STATE.audit_start, sendAuditEvent)
addEventApiHandler(AUDIT_STATE.audit_end, sendAuditEvent)
addEventApiHandler(AUDIT_STATE.audit_issue, sendAuditEvent)
addEventApiHandler(AUDIT_STATE.trip_start, sendVehicleEvent)
addEventApiHandler(AUDIT_STATE.trip_end, sendVehicleEvent)
addEventApiHandler(AUDIT_STATE.telemetry, sendTelemetryEvent)

// Store initialized with browser history and all app `reducers` defined above.
// NOTE: not for use in tests!
export const history = createBrowserHistory()
export const store = createAppStore(reducers, history)

// DEBUG: stick `_store` and `_actions` on window for console debugging
window._store = store
window._actions = bindActionCreators(actions, store.dispatch)
