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

//import { providers as mdsProviders } from 'mds-core/packages/mds-providers'
import { getConfigPaths } from 'config'

// HACK HACK HACK
// Hard-code providers for the nonce to avoid mds typescript compiling...
const mdsProviders = [
  {
    "id": "2411d395-04f2-47c9-ab66-d09e9e3c3251",
    "provider_name": "Bird",
    "url": "https://www.bird.co",
    "mds_api_url": "https://mds.bird.co",
    "gbfs_api_url": "https://mds.bird.co/gbfs"
  },
  {
    "id": "c20e08cf-8488-46a6-a66c-5d8fb827f7e0",
    "provider_name": "JUMP",
    "url": "https://jump.com",
    "mds_api_url": "https://api.uber.com/v0.2/emobility/mds"
  },
  {
    "id": "63f13c48-34ff-49d2-aca7-cf6a5b6171c3",
    "provider_name": "Lime",
    "url": "https://li.me",
    "mds_api_url": "https://data.lime.bike/api/partners/v1/mds"
  },
  {
    "id": "e714f168-ce56-4b41-81b7-0b6a4bd26128",
    "provider_name": "Lyft",
    "url": "https://www.lyft.com",
    "mds_api_url": "https: //api.lyft.com/v1/last-mile/mds"
  },
  {
    "id": "3c95765d-4da6-41c6-b61e-1954472ec6c9",
    "provider_name": "Sherpa",
    "mds_api_url": "https://mds.bird.co",
    "gbfs_api_url": "https://mds.bird.co/gbfs/platform-partner/sherpa-la"
  },
  {
    "id": "70aa475d-1fcd-4504-b69c-2eeb2107f7be",
    "provider_name": "Spin",
    "url": "https://www.spin.app",
    "mds_api_url": "https://api.spin.pm/api/v1/mds"
  },
  {
    "id": "b79f8687-526d-4ae6-80bf-89b4c44dc071",
    "provider_name": "Wheels",
    "url": "https://wheels.co",
    "mds_api_url": "https://mds.getwheelsapp.com"
  },
  {
    "id": "5f7114d1-4091-46ee-b492-e55875f7de00",
    "provider_name": "Test 1"
  }
]

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
