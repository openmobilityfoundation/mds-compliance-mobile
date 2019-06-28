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
// Bridge API for device-specific setup and event management api.
// Add functionality here rather than depending on specific cordova plugins/etc.
//
// Import as `device`, e.g.
//    import device from "device/events.js";
//    ...
//    if (device.isReady()) ....
// ------------------------------------
import getUUID from 'uuid/v4'

import { getStoredValue, storeValue } from './storage'

const device = {
  // ------------------------------------
  // Are we running in cordova?
  // ------------------------------------

  // Is this app embedded (e.g. running in Cordova vis just running in a browser)
  // NOTE: not defined until "deviceready".
  isEmbedded: typeof cordova !== 'undefined',

  // Is the device ready?
  // On cordova, false initially, true after cordova loads (see `deviceready` event handler below).
  // On non-cordova-browser, always true.
  isReady: typeof cordova === 'undefined',

  // Fire some code when the device is "ready".
  // If "deviceready" has already fired or we're not embedded, fires on 0-length timeout.
  onReady(callback) {
    if (!device.isEmbedded || device.isReady) {
      setTimeout(callback, 0)
    } else {
      document.addEventListener('deviceready', callback, false)
    }
  },

  // ------------------------------------
  // online status
  // ------------------------------------

  // Are we currently online?
  isOnline() {
    return window.navigator.onLine
  },
  isOffline() {
    return !window.navigator.onLine
  },

  // ------------------------------------
  // UDID: unique, stable device ID for this app
  // ------------------------------------

  // Return a unique device id for this device/browser.
  // On cordova, throws if device is not yet ready.
  getUDID() {
    // Generate a UUID and store in localStorage
    // NOTE: this can get wiped easily... :-(
    return getStoredValue('UDID') || storeValue('UDID', getUUID())
  }
}

// ------------------------------------
// Native event setup
// ------------------------------------

// Set up cordova-specific events.
if (device.isEmbedded) {
  device.onDeviceReady(() => {
    device.isReady = true
  })
}

export default device
