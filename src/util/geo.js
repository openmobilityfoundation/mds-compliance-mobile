/* eslint-disable import/prefer-default-export */
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

import * as turf from '@turf/helpers'

// TODO: REMOVEME
export function devicesToPoints(devices) {
  const points = []
  devices.forEach((d, i) => {
    const p = turf.point([d.lng, d.lat], d, {
      id: i
    })
    points.push(p)
  })
  return turf.featureCollection(points)
}

export function vehiclesToPoints(vehicles) {
  const points = vehicles
    // ignore vehicles without telemetry
    .filter(vehicle => vehicle.telemetry && vehicle.telemetry.gps)
    .map((vehicle, index) => {
      // Convert to `device` object shape
      const device = {
        provider_id: vehicle.provider_id,
        device_id: vehicle.device_id,
        vehicle_id: vehicle.vehicle_id,
        state: vehicle.status,
        lat: vehicle.telemetry.gps.lat,
        lng: vehicle.telemetry.gps.lng,
        timestamp: vehicle.telemetry.timestamp
      }
      // Convert to `point`
      return turf.point([device.lng, device.lat], device, {
        id: index
      })
  })
  return turf.featureCollection(points)
}
