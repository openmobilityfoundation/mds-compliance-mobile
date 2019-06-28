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
// Constants
// ------------------------------------

// State of the current audit.
export const AUDIT_STATE = {
  idle: 'idle',
  audit_start: 'audit_start',
  trip_start: 'trip_start',
  trip_end: 'trip_end',
  trip_enter: 'trip_enter',
  trip_leave: 'trip_leave',
  audit_end: 'audit_end',
  audit_issue: 'audit_issue',
  telemetry: 'telemetry'
}

// Load state of report list or report object
export const LOAD_STATE = {
  unloaded: undefined,
  loading: 'loading',
  loaded: 'loaded',
  error: 'error'
}

// State of an event in the event queue
export const QUEUE_STATE = {
  telemetry: 'telemetry', // Logged and awaiting telemetry data
  ready: 'ready', // Ready to send
  in_flight: 'in_flight', // In flight to server
  submitted: 'submitted', // Submitted to server, you can check `event.result`
  skipped: 'skipped', // Skipped sending event, check `event.error`
  error: 'error' // Error submitting to server, check `event.error`
}

// Details page being shown in the Reports page
export const REPORT_DETAILS_PAGE = {
  graph: 'graph',
  events: 'events',
  telemetry: 'telemetry'
}

// Telemetry gathering mode
export const TELEMETRY_MODE = {
  timer: 'timer', // Every 5 seconds on an interval
  location: 'location' // Use browser `geolocation.watchPosition`
}

// Policy for getting telemetry for events in eventQueue
export const TELEMETRY_POLICY = {
  none: 'none', // don't send telemetry data at all
  optional: 'optional', // try to get telemetry, if it times out, send event w/o telemetry
  required: 'required' // try to get telemetry, if it fails, don't send the event
}
