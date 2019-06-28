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
// Bridge API for geolocation api.
// Add functionality here rather than depending on specific cordova plugins/etc.
// ----
// Browser: Geolocation API
// https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
// ------------------------------------

import { getConfigPaths } from 'config'
import device from './device'

const config = getConfigPaths({
  geoOptions: 'apps.compliance.geolocation.options',
  geoCacheDuration: 'apps.compliance.geolocation.cacheDuration'
})

// Return promise which yields gelocation data for this device.
// This is a promise wrapper around `navigator.geolocation.getCurrentPosition()`
// Promise yields: `{ coords, timestamp }` where
//  - `coords` is at least:
//    - `latitude`
//    - `longitude`
//    - `accuracy`
//    - `altitude`    (may be null)
//    - `heading`     (may be null)
//    - `speed`       (may be null)
// - `timestamp` is a UNIX timestamp (milliseconds since 1970)
//
// NOTE: At least in Chrome and Safari on Mac/Desktop, multiple calls to `getCurrentPosition()`
//       will not necessarily resolve in the order in in which calls were made:
//       e.g. we might call:
//          ```
//          navigator.geolocation.getCurrentPosition(()=> console.log('a'))
//          navigator.geolocation.getCurrentPosition(()=> console.log('b'))
//          ```
//       and `b` will sometimes be logged before `a` (try the above in your console).
//
//       This indeterminacy is resulting in ordering problems with submitting events
//       via the EventQueue to the server:
//        1) We don't add events to the queue until telemetry has been returned (or fails)
//        2) If the calling order is not respected, event `b` may be added to the queue
//           before event `a`
//        3) Because the eventQueue always tries to dispatch events from the front of the queue
//           this can result in a server error if event `a` MUST be sent before `b`.
//
//       We solve this by caching the `promise` returned by `device.getLocation()`
//       for a short amount of time: multiple calls within a critical period
//       will receive the same promise back, and thus callbacks will be ordered properly.
//
let lastCacheTime
let cachedPromise
export function getLocation() {
  if (!navigator.geolocation) {
    return Promise.reject(new TypeError('`navigator.geolocation` not set up'))
  }

  // If we have been called before within `geoCacheDuration`, return the cached promise
  if (cachedPromise) {
    const delta = Date.now() - lastCacheTime
    if (delta < config.geoCacheDuration) {
      return cachedPromise
    }
  }

  // Generate a new promise to return the position, remembering it and the invocation time
  lastCacheTime = Date.now()
  cachedPromise = new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, config.geoOptions)
  )
  return cachedPromise
}

// Convert geolocation results to a `telemetry` object as it is defined in MDS.
function getTelemetryForLocation(location) {
  const telemetry = {
    device_id: device.getUDID(), // NOTE: assumes audit `device_id` is same as machine `udid`
    timestamp: location.timestamp,
    gps: {
      lat: location.coords.latitude,
      lng: location.coords.longitude
    }
  }
  if (location.coords.altitude) telemetry.gps.altitude = location.coords.altitude
  if (location.coords.heading) telemetry.gps.heading = location.coords.heading
  if (location.coords.speed) telemetry.gps.speed = location.coords.speed
  if (location.coords.accuracy) telemetry.gps.accuracy = location.coords.accuracy

  // Remember last telemetry checked
  device.telemetry = telemetry
  return telemetry
}

// Return promise which yields geolocation as `telemetry` object suitable for submitting to MDS.
// Promise will reject if location data not available.
export function getTelemetry() {
  return getLocation().then(getTelemetryForLocation)
}

// Start watching for changes in geolocation,
// calling `callback(telemetry)` whenever the location changes.
//
// Optional `errback` will be called if there's a geolocation error.
// Returns a `watcherId` which you must use to clear the watcher, see `stopWatchingTelemetry()`.
export function watchTelemetry(callback, errback = Function.prototype) {
  const success = location => callback(getTelemetryForLocation(location))
  return navigator.geolocation.watchPosition(success, errback, config.geoOptions)
}

// Stop watching telemetry changes.
// Use the `watcherId` passed by `watchTelemetry()`.
export function stopWatchingTelemetry(watcherId) {
  navigator.geolocation.clearWatch(watcherId)
}
