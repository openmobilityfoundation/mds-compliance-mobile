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

// API routines

import { getConfigPaths } from 'config'
import encodeQueryParams from 'util/queryParams'

import { AUDIT_STATE } from 'constants.js'
import { GET, DELETE, POST, RESPONSE_TYPES } from './api_utils'

const config = getConfigPaths({
  auditEndpoint: 'serverEndpoints.audit'
})

// ------------------------------------
// App-specific API calls
// ------------------------------------

// Return action event URL for `event.type`.
export function getEventURL(event) {
  switch (event.type) {
    case AUDIT_STATE.audit_start:
      return `${config.auditEndpoint}/trips/${event.auditTripId}/start`
    case AUDIT_STATE.trip_start:
      return `${config.auditEndpoint}/trips/${event.auditTripId}/vehicle/event`
    case AUDIT_STATE.trip_end:
      return `${config.auditEndpoint}/trips/${event.auditTripId}/vehicle/event`
    case AUDIT_STATE.audit_end:
      return `${config.auditEndpoint}/trips/${event.auditTripId}/end`
    case AUDIT_STATE.audit_issue:
      return `${config.auditEndpoint}/trips/${event.auditTripId}/event`
    case AUDIT_STATE.telemetry:
      return `${config.auditEndpoint}/trips/${event.auditTripId}/vehicle/telemetry`
    default:
      throw new TypeError(`Don't know how to find auth event url for event type '${event.type}'`)
  }
}

// Send `event` to the `audit/...` endpoint.
export function sendAuditEvent(event, accessToken) {
  return POST({
    url: getEventURL(event),
    accessToken,
    data: event.params,
    responseType: RESPONSE_TYPES.text,
    errorResponseType: RESPONSE_TYPES.json
  })
}

// Send `event` to the `vehicle/.../event` endpoint.
export function sendVehicleEvent(event, accessToken) {
  return POST({
    url: getEventURL(event),
    accessToken,
    data: event.params,
    responseType: RESPONSE_TYPES.json,
    errorResponseType: RESPONSE_TYPES.json
  })
}

// Send `event` to the `vehicle/telemetry` endpoint.
export function sendTelemetryEvent(event, accessToken) {
  return POST({
    url: getEventURL(event),
    accessToken,
    data: event.params,
    responseType: RESPONSE_TYPES.json,
    errorResponseType: RESPONSE_TYPES.json
  })
}

// Return list of audits.
export function getAuditReportList(accessToken, listParams) {
  return GET({
    url: `${config.auditEndpoint}/trips${encodeQueryParams(listParams)}`,
    accessToken,
    responseType: RESPONSE_TYPES.json,
    errorResponseType: RESPONSE_TYPES.json
  })
}

// Return data for a particular audit
export function getAuditReport(auditTripId, accessToken) {
  return GET({
    url: `${config.auditEndpoint}/trips/${auditTripId}`,
    accessToken,
    responseType: RESPONSE_TYPES.json,
    errorResponseType: RESPONSE_TYPES.json
  })
}

// Delete an audit
export function deleteAuditReport(auditTripId, accessToken) {
  return DELETE({
    url: `${config.auditEndpoint}/trips/${auditTripId}`,
    accessToken,
    responseType: RESPONSE_TYPES.text,
    errorResponseType: RESPONSE_TYPES.text
  })
}

// Return vehicles data for `bbox` (bounding box as string)
// and optional `providerId`
export async function getVehicles(bbox, providerId, accessToken) {
  //  return (await import('./vehicles-sample.json')).default
  const url = `${config.auditEndpoint}/vehicles?take=100000&bbox=${bbox}${
    providerId ? `&provider_id=${providerId}` : ''
  }`
  console.warn(url)
  return GET({
    url,
    accessToken,
    responseType: RESPONSE_TYPES.json,
    errorResponseType: RESPONSE_TYPES.text
  })
}
