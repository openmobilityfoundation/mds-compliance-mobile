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
// Bridge API for device-specific data storage.
// Add functionality here rather than depending on specific cordova plugins/etc.
// ------------------------------------

// ------------------------------------
// LocalStorage shims
// Values are automatically JSON encoded and prefixed with `APP_KEY`.
// ------------------------------------
const APP_KEY = 'MDS-compliance-'

// Clear locally stored value for `key`.
export function removeStoredValue(key) {
  return window.localStorage.removeItem(APP_KEY + key)
}

// Store `value` locally under `key`.
// `value` will automatically be JSON encoded.
export function storeValue(key, value) {
  if (value === undefined) return removeStoredValue(key)
  try {
    const encoded = JSON.stringify(value)
    window.localStorage.setItem(APP_KEY + key, encoded)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`device.storeValue(${key}): error stringifying value`, e, value)
  }
  return value
}

// Retrieved locally stored `value`.
// `value` will automatically be JSON decoded.
export function getStoredValue(key) {
  const value = window.localStorage.getItem(APP_KEY + key)
  if (value !== undefined) return JSON.parse(value)
  return value
}

// Shim localStorage if not defined.
// Note: if shim is used, all data will be cleared on reload.
if (!window.localStorage) {
  window.localStorage = {}
  window.localStorage.setItem = (key, value) => {
    window.localStorage[key] = value
  }
  window.localStorage.getItem = key => {
    return window.localStorage[key]
  }
  window.localStorage.removeItem = key => {
    delete window.localStorage[key]
  }
}
