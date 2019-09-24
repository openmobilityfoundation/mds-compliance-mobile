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

import { ConnectedRouter } from 'connected-react-router'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import appConfig, { getConfigPaths } from 'config'
import AuthLock from 'components/AuthLock'
import device from 'device/index'
import { actions, history, store } from 'store/index'

import * as serviceWorker from './serviceWorker'
import App from './App'
import './index.scss'

// Load app config
const config = getConfigPaths({
  appName: 'apps.compliance.app.name'
})

// DEBUG: print out config vars for inspection
// eslint-disable-next-line no-console
console.info('App config:', { ...appConfig })

// Set window title as per config
document.title = config.appName

// Create the react app once the device is ready.
// Thus 99% of our code will fire when cordova/etc is already set up.
device.onReady(() => {
  // Initialize the audit to start watching telemetry events
  store.dispatch(actions.initAudit())
  // Initialize the event queue to flush any existing events in localStorage
  store.dispatch(actions.initEventQueue())

  ReactDOM.render(
    <Provider store={store}>
      <AuthLock>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </AuthLock>
    </Provider>,
    document.getElementById('root')
  )
})

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
