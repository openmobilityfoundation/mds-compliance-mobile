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
// Load the appropriate configuration for the current deployment
// ------------------------------------

import get from 'lodash/get'

import productionConfig from './config/production'
import stagingConfig from './config/staging'
import devConfig from './config/dev'

// Figure out the current deployment environment.
const env = process.env.REACT_APP_ENV || process.env.NODE_ENV
if (!env) throw new TypeError('You must set REACT_APP_ENV or NODE_ENV before building')

// eslint-disable-next-line import/no-mutable-exports
let config
if (env === 'dev') {
  config = devConfig
} else if (env === 'staging') {
  config = stagingConfig
} else {
  config = productionConfig
}

// Export config for this envrionment as default export.
export default config

// Export `getConfigPaths()` bound to the app config.
// This is your main app entry to getting random variables from the config.
// Import as `import { getConfigPaths } from "config"`
export function getConfigPaths(nameToPathMap) {
  return Object.keys(nameToPathMap).reduce((results, name) => {
    const path = nameToPathMap[name]
    const value = get(config, path)
    if (value === undefined) throw new TypeError(`getConfigPaths(): path '${path}' not defined!`)
    // eslint-disable-next-line no-param-reassign
    results[name] = value
    return results
  }, {})
}
