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

const stagingOverrides = {
  // Sanity check so you can tell this is `staging` configuration.
  _env: 'staging',

  apps: {
    compliance: {
      app: {
        // Show "STAGING" in app/window title so you can tell which environment is running
        name: 'STAGING Compliance Mobile',
        // NOTE: Main App URL -- must match value in Auth0
        url: 'https://dev.mdscompliance.app/'
      }
    }
  },

  authentication: {
    auth0: {
      // NOTE: If you have a separate Auth0 app for dev (vs production)
      //       add its clientId here.
      // clientId: undefined,
      clientId: 'sgsSRcN9PLQhzseYH9cmrYDtp5NxC9s1'
    }
  },

  deploy: {
    s3: {
      bucketUrl: 's3://dev.mdscompliance.app',
      profile: 'dev-ea'
    }
  },

  serverEndpoints: {
    audit: 'https://api.dev.mdscompliance.app/audit',
  }
}

const stagingConfig = merge(cloneDeep(productionConfig), cloneDeep(stagingOverrides))
export default stagingConfig
