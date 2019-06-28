/* eslint-disable no-param-reassign */
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
// Utility methods for working with `events`: `audit_events`, `vehicle_events`, `telemetry` events
// ------------------------------------

// Attempt to extract telemetry out of an `event` and return as `{ lat, lng }`
// Returns `undefined` if we can't figure it out or bad data.
export function getEventCoords(event) {
  if (!event) return undefined

  let lat
  let lng
  if (event.lat && event.lng) {
    ;({ lat, lng } = event)
  } else if (event.gps) {
    ;({ lat, lng } = event.gps)
  } else if (event.params && event.params.telemetry && event.params.telemetry.gps) {
    ;({ lat, lng } = event.params.telemetry.gps)
  }

  if (typeof lat === 'number' && typeof lng === 'number') {
    return { lat, lng }
  }
  return undefined
}

// Return telemetry distance between two `event`s, in whatever units the `ruler` is set up with.
// If we don't have a `ruler` set up, or either event has no telemetry, value will be `NaN`.
export function getEventDistance(ruler, event1, event2) {
  if (!ruler) return NaN
  const coords1 = getEventCoords(event1)
  const coords2 = getEventCoords(event2)
  if (!coords1) return NaN
  if (!coords2) return NaN
  // distance in meters
  return ruler.distance([coords1.lat, coords1.lng], [coords2.lat, coords2.lng])
}

// Return the total trip `distance` in meters given a set of `events` with `lat` and `lng`.
// Restricts to events w `timestamp` in specified `start` and `end` if provided.
// Returns `NaN` if no events or no events with telemetry data.
export function getEventTripDistance(ruler, events, start, end) {
  if (!events || !ruler) return NaN

  // Throw out anything for which we can't get coords
  events = events.filter(getEventCoords)
  // Throw out everything not within `start...end`, inclusive
  if (start && end) {
    events = events.filter(event => event.timestamp >= start && event.timestamp <= end)
  }

  if (!events.length) return NaN

  const coordsArray = events
    .map(getEventCoords)
    // convert to mapbox format
    .map(coords => {
      return [coords.lat, coords.lng]
    })
  // distance in meters
  return ruler.lineDistance(coordsArray)
}
