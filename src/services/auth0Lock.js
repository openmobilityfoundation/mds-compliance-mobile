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
// Auth0 `Lock` to show lock UI
// ------------------------------------
import Auth0Lock from 'auth0-lock'
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

/**
 * configurationBaseUrl - supports use of custom domain with embedded Lock widget
 * redirect - false to force popup for better mobile experience
 */
const options = {
  configurationBaseUrl: 'https://cdn.auth0.com',
  allowAutocomplete: true,
  autoclose: true,
  autofocus: true,
  auth: {
    redirect: false,
    redirectUrl: config.appUrl,
    responseType: 'token id_token',
    params: {
      scope: 'openid profile email audits:read audits:write'
    },
    audience: config.auth0Audience
  },
  theme: {
    logo: `${process.env.PUBLIC_URL}${config.auth0LogoPath}`,
    primaryColor: 'black'
  },
  languageDictionary: {
    title: config.appName
  }
}

// Export lock widget, pass to `<AuthLock>` component
const lock = new Auth0Lock(config.auth0ClientId, config.auth0Domain, options)
export default lock
