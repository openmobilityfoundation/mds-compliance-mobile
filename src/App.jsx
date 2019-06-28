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
import React from 'react'
import '@ionic/core/css/core.css'
import '@ionic/core/css/ionic.bundle.css'
import { IonApp, IonPage, IonSplitPane } from '@ionic/react'

import AppMenu from 'components/AppMenu'
import { AppRoutes } from 'pages/index'

class App extends React.Component {
  render() {
    return (
      <div id='app'>
        <IonApp>
          <IonSplitPane contentId='main'>
            <AppMenu />
            <IonPage id='main'>
              <AppRoutes />
            </IonPage>
          </IonSplitPane>
        </IonApp>
      </div>
    )
  }
}

export default App
