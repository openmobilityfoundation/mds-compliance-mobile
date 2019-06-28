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
import {
  IonCol,
  IonGrid,
  //  IonIcon,
  IonRow
} from '@ionic/react'

import { withReports } from 'store/index'
import { printTime } from 'util/time'

import SectionHeader from 'components/SectionHeader'
import EventLocationLink from './EventLocationLink'
import ValueCol from './ValueCol'

import './AuditTable.scss'
import './AuditGrid.scss'

export function DeltaRow({ event }) {
  return (
    <IonRow align-items-start align-items-stretch key={event.event_type} class='event hydrated'>
      <IonCol class='value timestamp hydrated'>{printTime(event.audit.timestamp)}</IonCol>
      <IonCol class='value location hydrated'>
        <EventLocationLink event={event.audit} multiline />
      </IonCol>
      <IonCol class='value location hydrated'>
        <EventLocationLink event={event.provider} multiline />
      </IonCol>
      <ValueCol
        className='distance'
        value={event.location_accuracy}
        threshold={event.thresholds.location_accuracy}
        units={'m'}
      />
      <ValueCol className='time' value={event.time_accuracy} threshold={event.thresholds.time_accuracy} units={'s'} />
    </IonRow>
  )
}

DeltaRow.propTypes = {
  event: PropTypes.object.isRequired
}

export function _AuditTelemetryTable({ report }) {
  if (!report.deltas || !report.deltas.length) {
    return (
      <div className='AuditTable  AuditTelemetryTable empty'>
        <SectionHeader subtitle='(No telemetry events matched)' />
      </div>
    )
  }
  return (
    <div className='AuditTable  AuditTelemetryTable'>
      <IonGrid fixed class='AuditGrid hydrated'>
        <IonRow align-items-end class='event header hydrated'>
          <IonCol class='label timestamp hydrated'>Time</IonCol>
          <IonCol class='label location hydrated'>Audit</IonCol>
          <IonCol class='label location hydrated'>Provider</IonCol>
          <IonCol class='label distance hydrated'>{'\u0394 Dist.'}</IonCol>
          <IonCol class='label time hydrated'>{'\u0394 Time'}</IonCol>
        </IonRow>
        {report.deltas.map((event, index) => (
          <DeltaRow key={index} event={event} />
        ))}
      </IonGrid>
    </div>
  )
}

_AuditTelemetryTable.propTypes = {
  actions: PropTypes.object.isRequired,
  report: PropTypes.object.isRequired
}

export default withReports(_AuditTelemetryTable)
