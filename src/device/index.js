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

import device from './device'
import { getLocation, getTelemetry, watchTelemetry, stopWatchingTelemetry } from './geolocation'
import { getStoredValue, storeValue, removeStoredValue } from './storage'

// Add methods/etc above to `device` object so you can just import the one thing.
device.getLocation = getLocation
device.getTelemetry = getTelemetry
device.watchTelemetry = watchTelemetry
device.stopWatchingTelemetry = stopWatchingTelemetry
device.getStoredValue = getStoredValue
device.storeValue = storeValue
device.removeStoredValue = removeStoredValue

// DEBUG: add `_device` to window for console debugging.
window._device = device
export default device
