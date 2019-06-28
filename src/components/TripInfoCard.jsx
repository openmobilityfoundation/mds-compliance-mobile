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
import { IonCol, IonGrid, IonRow } from '@ionic/react'

import device from 'device/index'
import { withAudit } from 'store/index'
import { getTimeDelta /* printTime */ } from 'util/time'

import { getTelemetryModeLabel } from './labels'

// Properties to display
const propsToDisplay = [
  { prop: 'deviceProviderName', label: 'Provider:' },
  { prop: 'providerVehicleId', label: 'Vehicle:' },
  { prop: 'auditTripId', label: 'Audit Trip ID:' },

  { prop: 'telemetryMode', label: 'Telemetry Mode:', transform: getTelemetryModeLabel },
  // lat/long on one row
  function display() {
    if (!device.telemetry) return {}
    const { lat, lng } = device.telemetry.gps
    if (!lat || !lng) return {}
    return { label: 'Location:', value: `${lat.toPrecision(8)}, ${lng.toPrecision(8)}` }
  },

  //  Trip time display, changes based on trip status
  function display(audit) {
    const { tripStarted, tripEnded } = audit
    if (!tripStarted && !tripEnded) return {}
    if (tripEnded) {
      return { label: 'TRIP TIME:', value: `${getTimeDelta(tripStarted, tripEnded)} sec` }
    }
    return { label: 'ON TRIP:', value: `${getTimeDelta(tripStarted, Date.now())} sec` }
  }
]

export function HeaderRow({ header }) {
  return (
    <IonRow>
      <IonCol size='12'>
        <b>{header}</b>
      </IonCol>
    </IonRow>
  )
}

HeaderRow.propTypes = {
  header: PropTypes.string
}

export function ItemRow({ label, value }) {
  return (
    <IonRow>
      <IonCol size='5' class='ellipsized no-padding'>
        <b>{label}</b>
      </IonCol>
      <IonCol size='7' class='ellipsized no-padding'>
        {value}
      </IonCol>
    </IonRow>
  )
}

ItemRow.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any
}

function displayProps(audit) {
  return propsToDisplay
    .map((item, index) => {
      if (typeof item === 'function') {
        const { label, value } = item(audit)
        return <ItemRow key={index} label={label} value={value} />
      }

      const { header, prop, label, transform } = item
      if (header) return <HeaderRow key={header} header={header} />

      let value = audit[prop]
      if (value == null || value === '') return undefined
      if (transform) value = transform(value)
      return <ItemRow key={prop} label={label} value={value} />
    })
    .filter(Boolean)
}

// Export unwrapped for testing.
export class _TripInfoCard extends React.Component {
  // Timer to update the widget every second (mostly for on-trip time).
  componentDidMount() {
    this.TIMER = setInterval(() => this.setState({ time: Date.now() }), 1000)
  }

  componentWillUnmount() {
    clearInterval(this.TIMER)
  }

  render() {
    const { audit } = this.props
    return (
      <div style={{ padding: '2px 8px' }}>
        <IonGrid>{displayProps(audit)}</IonGrid>
      </div>
    )
  }
}

_TripInfoCard.propTypes = {
  audit: PropTypes.object.isRequired
}

// Export wrapped for app consumption.
export default withAudit(_TripInfoCard)
