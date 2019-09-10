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

import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'
import productionConfig from './production'

const devOverrides = {
  // Sanity check so you can tell this is `dev` configuration.
  _env: 'dev',

  apps: {
    compliance: {
      app: {
        // Show "DEV" in app/window title so you can tell which environment is running
        name: 'DEV Compliance Mobile',
        // Main App URL -- must match value in Auth0
        url: 'https://localhost:3001/'
      }
    }
  },

  authentication: {
    auth0: {
      // NOTE: If you have a separate Auth0 app for dev (vs production)
      //       add its clientId here.
      // clientId: undefined,
      clientId: 'sgsSRcN9PLQhzseYH9cmrYDtp5NxC9s1',
      audience: 'https://sandbox.ladot.io'
    }
  },

  // No deploy for dev environment
  deploy: null,

  serverEndpoints: {
    // Server API endpoint.  `localhost:4002` is appropriate if you're running
    // audit server on the same machine.  If running from external server,
    // override here if it's the same for all developers,
    // or set `REACT_APP_MDS_AUDIT_ENDPOINT` in file `.env.development.local`
    // (which is not checked in) if override is just for your server.
    audit: process.env.REACT_APP_MDS_AUDIT_ENDPOINT || 'https://api.dev.mdscompliance.app/audit'
    //     audit: process.env.REACT_APP_MDS_AUDIT_ENDPOINT || 'http://localhost:4002/audit',
  }
}

const devConfig = merge(cloneDeep(productionConfig), cloneDeep(devOverrides))
export default devConfig
