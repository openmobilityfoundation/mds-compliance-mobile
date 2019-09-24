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
// Auth0.js client - singleton export that is instantiated once and can be imported and used throughout an app
// ------------------------------------
import * as auth0js from 'auth0-js'
import { getConfigPaths } from 'config'

// Get config data we'll use below.  Throws if path values are undefined.
const config = getConfigPaths({
  appName: 'apps.compliance.app.name',
  appUrl: 'apps.compliance.app.url',

  auth0ClientId: 'authentication.auth0.clientId',
  auth0Domain: 'authentication.auth0.domain',
  auth0Audience: 'authentication.auth0.audience',
  auth0LogoPath: 'authentication.auth0.logoPath'
})

const auth0 = new auth0js.WebAuth({
  domain: config.auth0Domain,
  clientID: config.auth0ClientId,
  redirectUri: config.appUrl,
  responseType: 'token id_token',
  scope: 'openid profile email audits:read audits:write audits:delete audits:vehicles:read',
  audience: config.auth0Audience
})

export default auth0
