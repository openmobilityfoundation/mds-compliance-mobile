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

import startCase from 'lodash/startCase'

import { AUDIT_STATE, TELEMETRY_MODE } from 'constants.js'

export const EVENT_LABELS = {
  [AUDIT_STATE.audit_start]: 'Audit Start',
  [AUDIT_STATE.audit_end]: 'Audit End',
  [AUDIT_STATE.audit_issue]: 'Issue Report',
  [AUDIT_STATE.trip_start]: 'Trip Start',
  [AUDIT_STATE.trip_end]: 'Trip End',
  [AUDIT_STATE.trip_enter]: 'Trip Enter',
  [AUDIT_STATE.trip_leave]: 'Trip Leave',
  [AUDIT_STATE.telemetry]: 'Telemetry',

  // provider events we don't do anything with, but are reported
  provider_pick_up: 'Pick Up',
  provider_drop_off: 'Drop Off'
}

// Return label given an `event` (with `type` or `event_type`)
export function getEventLabel(event) {
  const type = event.event_type || event.type
  if (EVENT_LABELS[type]) return EVENT_LABELS[type]
  // Do simple case transformation for events we don't recognize
  return startCase(type)
}

// Current issue labels.
// These will appear in the `<IssueSelect>`
// If you're deprecating an issue that was used before,
//  add it to `DEPRECATED_ISSUE_LABELS`.
export const ISSUE_LABELS = {
  dsc_vehicle_not_found: 'Discovery - Device missing / not found',
  dsc_vehicle_map_incorrect: 'Discovery - Device found, incorrect map location',
  dsc_vehicle_not_registered: 'Discovery - Device found, not registered',
  prk_incorrectly_parked: 'Parking - Incorrectly parked',
  mnt_unsafe_device: 'Maintenance - Unsafe device',
  ops_trip_start_fail: 'Ops - Provider could not initiate trip',
  ops_trip_end_fail: 'Ops - Provider could not end trip',
  oth_user_reported: 'Other issue'
}

// DEPRECATED issue labels (for display only, user can't select them).
const DEPRECATED_ISSUE_LABELS = {
  oth_flag_for_review: 'Flag for review'
}

// Return issue label WITH category for an `event`
export function getIssueLabel(event) {
  const issueName = event.issue || event.audit_issue_code || 'oth_user_reported'
  return ISSUE_LABELS[issueName] || DEPRECATED_ISSUE_LABELS[issueName] || ''
}

// Return issue label WITHOUT category for an `event`
export function getIssueTitle(event) {
  const label = getIssueLabel(event)
  const match = /^(\w+) - (.*)$/.exec(label)
  if (match) return match[2]
  return label
}

// Return issue label category for an `event`.
export function getIssueCategory(event) {
  const label = getIssueLabel(event)
  const match = /^(\w+) - (.*)$/.exec(label)
  if (match) return match[1]
  return label
}

// Notes / issues / etc
export const NOTE_TYPE_LABELS = {
  issue: 'Issue:',
  note: 'Note:',
  summary: 'Summary:'
}

export function getNoteTypeLabel(event) {
  const type = event.audit_event_type || event.type
  return NOTE_TYPE_LABELS[type] || NOTE_TYPE_LABELS.note
}

const TELEMETRY_MODE_LABELS = {
  [TELEMETRY_MODE.timer]: '5 second Timer',
  [TELEMETRY_MODE.location]: 'GPS Location'
}
export function getTelemetryModeLabel(mode) {
  return TELEMETRY_MODE_LABELS[mode] || 'UNKNOWN TELEMETRY_MODE'
}
