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
//  <AuthLock/> component
//  Wraps the <App/> so they can't do anything at all when not authenticated.
//  NOTE: you MUST pass a `lock` created with `Auth0Lock`,
//  the normal pattern is to get `lock` exported from `store/auth.js`.
// ------------------------------------

import React from 'react'
import PropTypes from 'prop-types'
import auth0 from 'services/auth0'

import { withAuth } from 'store/index'

class AuthLock extends React.Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired,
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
    lock: PropTypes.object.isRequired
  }

  componentDidMount() {
    this.checkAuth(this.props)
  }

  checkAuth() {
    if (/access_token|id_token|error/.test(window.location.hash)) {
      // Process callback
      this.processAuth()
    } else if (localStorage.getItem('isLoggedIn') === 'true') {
      // Fetch a new token
      this.renewAuth()
    } else {
      // Redirect to auth0 login form and callback
      auth0.authorize()
    }
  }

  processAuth = options => {
    auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        auth0.client.userInfo(authResult.accessToken, (error, profile) => {
          // Finish login
          if (error) return
          // Get the time in millis that the access token will expire at
          const expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime())
          this.props.actions.saveAuth({
            accessToken: authResult.accessToken,
            idToken: authResult.idToken,
            expiresAt,
            profile
          })
        })
      } else if (err) {
        console.warn('Auth error', err)
        this.props.actions.failAuth()
      }
    })
  }

  renewAuth = options => {
    auth0.checkSession({}, (err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.props.actions.saveAuth(authResult)
      } else if (err) {
        this.props.actions.logout()
        console.warn(err)
      }
    })
  }

  /**
   * Verify token is not expired
   */
  isAuthenticated() {
    // Check whether the current time is past the access token's expiration time
    const { auth } = this.props
    return auth && auth.expiresAt && Date.now() < auth.expiresAt
  }

  render() {
    return this.isAuthenticated() ? this.props.children : <div />
  }
}

export default withAuth(AuthLock)
