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
// Utility methods for working with time
// ------------------------------------
import moment from 'moment-timezone'

// Convert `timestamp` to human-friendly date string
// Returns `undefined` if not a number.
export function printDate(timestamp, invalidResult = null) {
  if (typeof timestamp !== 'number') return invalidResult
  return moment(timestamp).format('MM/DD/YY')
}

// Convert `timestamp` to human-friendly time string
// Returns `undefined` if not a number.
export function printTime(timestamp, invalidResult = null) {
  if (typeof timestamp !== 'number') return invalidResult
  return moment(timestamp).format('HH:mm:ss')
}

export function printDateTime(timestamp, invalidResult = null) {
  if (typeof timestamp !== 'number') return invalidResult
  return `${printDate(timestamp)} ${printTime(timestamp)}`
}

// Return absolute delta between two timestamps in seconds.
// Returns `NaN` if either is not a number.
export function getTimeDelta(timestamp1, timestamp2) {
  if (typeof timestamp1 !== 'number') return NaN
  if (typeof timestamp2 !== 'number') return NaN
  return Math.floor(Math.abs(timestamp1 - timestamp2) / 1000)
}
