/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-console */
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
// Generic API utilities
// ------------------------------------

// Network error encountered by fetch (e.g. offline)
export const NETWORK_ERROR_STATUS = -1

// Error parsing response
export const RESPONSE_PARSE_ERROR = -2

// Response type to return on successful fetch.
export const RESPONSE_TYPES = {
  text: 'text',
  json: 'json',
  blob: 'blob'
}

// Perform a generic `GET`
// See `FETCH()` below for parameter definition.
export function GET({ url, fetchParams = {}, responseType, errorResponseType, accessToken }) {
  fetchParams = {
    method: 'GET',
    ...fetchParams
  }
  return FETCH({ url, fetchParams, responseType, errorResponseType, accessToken })
}

// Perform a generic 'POST'
// `data` is object of body params (will be stringified automatically).
// See `FETCH()` below for parameter definition.
export function POST({ url, data, fetchParams = {}, responseType, errorResponseType, accessToken }) {
  fetchParams = {
    method: 'POST',
    ...fetchParams
  }
  if (data) fetchParams.body = JSON.stringify(data)
  return FETCH({ url, fetchParams, responseType, errorResponseType, accessToken })
}

// Perform a generic 'DELETE'
// See `FETCH()` below for parameter definition.
export function DELETE({ url, fetchParams = {}, responseType, errorResponseType, accessToken }) {
  fetchParams = {
    method: 'DELETE',
    ...fetchParams
  }
  return FETCH({ url, fetchParams, responseType, errorResponseType, accessToken })
}

// Perform a `fetch()`, rejecting if there's a (server or network) error.
//
// `url` (required) should have any query params already attached.
// `fetchParams` (optional) params to pass in to `fetch()`.
// `accessToken` is Auth0 "bearer token"
// `responseType` is data type used to transform successful fetch response.
// `errorResponseType` is data type used to transform error fetch response.
//
// On success:              `resolve()`s with response data according to `responseType`
// On server error:         `rejects()`s with `{ status: <http status>, data: <responseData> }`
//                           where `<responseData>` is according to `errorResponseType`.
// On fetch error:          `rejects()`s with `{ status: NETWORK_ERROR_STATUS, error: <thrown error> }`
// On JSON parse error:     `rejects()`s with `{ status: RESPONSE_PARSE_ERROR, error: <thrown error> }`
export async function FETCH(params) {
  const {
    url,
    accessToken,
    fetchParams = {},
    responseType = RESPONSE_TYPES.text,
    errorResponseType = RESPONSE_TYPES.json
  } = params

  if (!url) throw new TypeError('FETCH must be called with params.url')

  // Set up authorization headers
  if (!accessToken) throw new TypeError('FETCH must be called with params.accessToken')
  fetchParams.headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }

  // Run the `fetch`
  let response
  try {
    response = await fetch(url, fetchParams)
  } catch (error) {
    // fetch will only fail on network failure (regardless of server status)
    console.warn('FETCH: network error:', error)
    // Send back error with special status on network failure (e.g. offline)
    return Promise.reject({ status: NETWORK_ERROR_STATUS, error })
  }

  // If there was a server error, reject with `status` and whatever data server sent back
  if (!response.ok) {
    console.warn('FETCH: response not ok:', response)
    const data = await getResponseData(response, errorResponseType)
    return Promise.reject({ status: response.status, data })
  }

  // No error, resolve with the decoded response
  try {
    return getResponseData(response, responseType)
  } catch (error) {
    // return with special status on parse error
    return Promise.reject({ status: RESPONSE_PARSE_ERROR, error })
  }
}

// Call async `response` routine to get data according to `responseType`
function getResponseData(response, responseType) {
  switch (responseType) {
    case RESPONSE_TYPES.json:
      return response.json()
    case RESPONSE_TYPES.text:
      return response.text()
    case RESPONSE_TYPES.blob:
      return response.blob()
    default:
      throw new TypeError(`getResponseData(): don't know how to process response type '${responseType}'`)
  }
}
