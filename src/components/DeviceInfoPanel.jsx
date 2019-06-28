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
import PropTypes from 'prop-types'
import { IonButton } from '@ionic/react'

import { getProviderName } from 'util/providers'
import scooterIcon from 'assets/scooter.svg'

import './DeviceInfoPanel.scss'

const DeviceIcon = props => {
  return (
    <div
      style={{
        backgroundColor: props.color || '#555',
        width: 35,
        height: 35,
        borderRadius: 35,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <img height={36} width={36} src={props.icon} alt='logo' />
    </div>
  )
}

DeviceIcon.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.string.isRequired
}

const DeviceInfoPanel = props => {
  const { device, onActionClick } = props

  let color = null
  switch (device.state) {
    case 'available':
      color = '#4fd71d'
      break
    case 'inactive':
      color = '#f36d6d'
      break
    case 'reserved':
    case 'trip':
      color = '#dbdb1a'
      break
    default:
      color = '#000000'
  }

  return (
    <div
      className='info-panel'
      key='info'
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <DeviceIcon icon={scooterIcon} color={color} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%'
          }}
        >
          <div style={{ marginLeft: 10, fontSize: 16, fontWeight: 500 }}>
            {device.state.charAt(0).toUpperCase() + device.state.slice(1)}
          </div>
          <div>{getProviderName(device.provider_id)}</div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* <UpdateIcon style={{ height: 18, width: 18, color: "#999" }} /> */}
          <div style={{ marginLeft: 5, fontSize: 12, color: '#333' }}>
            {new Date(Number(device.timestamp)).toLocaleTimeString()}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* <PinDropIcon style={{ height: 18, width: 18, color: "#999" }} /> */}
          <small style={{ marginLeft: 5, fontSize: 12, color: '#333' }}>
            ({device.lng}, {device.lat})
          </small>
        </div>
      </div>
      <div>
        <div style={{ marginTop: 5 }}>
          <div>
            <small>Vehicle ID: {device.vehicle_id}</small>
          </div>
          <div>
            <small>Device ID: {device.device_id}</small>
          </div>
        </div>
      </div>
      {onActionClick && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
          <IonButton size='small' color='light' onClick={() => props.onActionClick(device)}>
            {props.actionText}
          </IonButton>
        </div>
      )}
    </div>
  )
}

DeviceInfoPanel.propTypes = {
  actionText: PropTypes.string.isRequired,
  device: PropTypes.object.isRequired,
  onActionClick: PropTypes.func
}

export default DeviceInfoPanel
