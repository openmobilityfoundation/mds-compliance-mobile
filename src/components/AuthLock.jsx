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

import { withAuth } from 'store/index'
import './AuthLock.scss'

class AuthLock extends React.Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired,
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
    lock: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
    this.props.lock.on('authenticated', this.startLogin)
    this.props.lock.on('authorization_error', this.authError)
  }

  componentDidMount() {
    this.check(this.props)
  }

  componentDidUpdate() {
    this.check(this.props)
  }

  check() {
    if (!this.isAuthenticated()) {
      this.props.lock.show()
    }
  }

  startLogin = authResult => {
    if (authResult && authResult.accessToken && authResult.idToken) {
      this.props.lock.getUserInfo(authResult.accessToken, (error, profile) => {
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
    }
  }

  authError = err => {
    this.props.lock.show({
      flashMessage: {
        type: 'error',
        text: err.errorDescription
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
