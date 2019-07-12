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

import { providers as mdsProviders } from 'mds-core/packages/mds-providers'
import { getConfigPaths } from 'config'

// Use `getConfigPaths` to get values from current config.
// This will throw if any paths are not defined.
const config = getConfigPaths({
  activeProviders: 'provider.activeProviders'
})

// Return active providers as an array of `{ id, ...provider }`
//  as specified in default app `config`
export function getActiveProviders() {
  // Convert mdsProviders to a map by lower-case name
  const providersByName = Object.keys(mdsProviders).reduce((map, id) => {
    const provider = { id, ...mdsProviders[id] }
    // eslint-disable-next-line no-param-reassign
    map[provider.provider_name.toLowerCase()] = provider
    return map
  }, {})

  // Add `Test` provider
  const providers = [...config.activeProviders, 'Test 1']
  return providers
    .map(providerName => {
      const provider = providersByName[providerName.toLowerCase()]
      // eslint-disable-next-line no-console
      if (!provider) console.error(`Couldn't find provider ${providerName}`)
      return provider
    })
    .filter(Boolean) // remove any that weren't found
}

export function getProviderName(providerId, missingName = 'Unknown Provider') {
  const provider = mdsProviders[providerId]
  if (provider) return provider.provider_name
  return missingName
}
