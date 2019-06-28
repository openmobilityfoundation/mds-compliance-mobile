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

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonMenuButton, IonTitle, IonToolbar } from '@ionic/react'

import { AUDIT_STATE } from 'constants.js'
import AuthPopover from 'components/AuthPopover'
import DeviceInfoPanel from 'components/DeviceInfoPanel'
import FindNearbyDeviceMap from 'components/FindNearbyDeviceMap'
import ProviderSelect from 'components/ProviderSelect'
import { getConfigPaths } from 'config'
import { withAudit, withPage } from 'store/index'

const config = {
  mapbox: getConfigPaths({
    settings: 'apps.compliance.mapbox.settings',
    token: 'apps.compliance.mapbox.token'
  })
}

function _MapPage(props) {
  const { actions, audit, page } = props
  const [selectedDevice, selectDevice] = useState(null)

  function startAudit(device) {
    actions.completeAudit()
    actions.startAudit(device)
    actions.showAudits()
  }

  function selectProvider(id) {
    actions.setMapProviderId(id)
  }

  let infoPanel = null
  if (selectedDevice) {
    const { auditTripId, state } = audit
    // Don't enable "start audit" button if there's an active audit
    const onClick = !auditTripId || state === AUDIT_STATE.audit_end ? startAudit : null
    infoPanel = <DeviceInfoPanel key='info' actionText='Start Audit' onActionClick={onClick} device={selectedDevice} />
  } else {
    infoPanel = null
  }

  return (
    <>
      <IonHeader>
        <IonToolbar color='primary'>
          <IonButtons slot='start'>
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Map</IonTitle>
          <IonButtons slot='end'>
            <AuthPopover />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent scrollY={false}>
        <IonHeader>
          <IonToolbar>
            <IonItem lines='none'>
              <IonLabel>Provider:</IonLabel>
              <ProviderSelect showAny={true} value={page.mapProviderId} onChange={selectProvider} />
            </IonItem>
          </IonToolbar>
        </IonHeader>
        <FindNearbyDeviceMap
          mapID='find-nearby-device-map'
          token={config.mapbox.token}
          {...config.mapbox.settings}
          providerId={page.mapProviderId}
          onSelect={selectDevice}
        />
        {infoPanel}
      </IonContent>
    </>
  )
}

_MapPage.propTypes = {
  actions: PropTypes.any,
  audit: PropTypes.any,
  page: PropTypes.any
}

export default withPage(withAudit(_MapPage))
