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

import { withReports } from 'store/index'
import { printTime /* , getTimeDelta */ } from 'util/time'

import EventLocationLink from './EventLocationLink'
import { getEventLabel } from './labels'
import SectionHeader from './SectionHeader'

import './AuditTable.scss'
import './AuditGrid.scss'

export function EventRow({ event }) {
  const isAuditEvent = !!event.audit_trip_id
  const isAuditDomain = isAuditEvent || event.domain === 'audit'
  const label = getEventLabel(event)
  return (
    <IonRow align-items-start align-items-stretch key={event.event_type} class='event hydrated'>
      <IonCol class='value timestamp hydrated'>{printTime(event.timestamp)}</IonCol>
      <IonCol class='value type hydrated'>{label}</IonCol>
      <IonCol class='value location hydrated'>
        {isAuditDomain ? <EventLocationLink event={event} multiline /> : null}
      </IonCol>
      <IonCol class='value location hydrated'>
        {!isAuditDomain ? <EventLocationLink event={event} multiline /> : null}
      </IonCol>
    </IonRow>
  )
}

EventRow.propTypes = {
  event: PropTypes.object.isRequired
}

export function _AuditEventsTable({ report }) {
  const { allEvents } = report
  if (!allEvents || !allEvents.length) {
    return (
      <div className='AuditTable AuditEventsTable empty'>
        <SectionHeader subtitle='(No events found)' />
      </div>
    )
  }
  return (
    <>
      <div className='AuditTable AuditEventsTable'>
        <IonGrid class='AuditGrid hydrated'>
          <IonRow align-items-end class='event header hydrated'>
            <IonCol class='label timestamp hydrated'>Time</IonCol>
            {/* <IonCol class="label delta hydrated">Delta</IonCol> */}
            <IonCol class='label type hydrated'>Event</IonCol>
            <IonCol class='label location hydrated'>Audit</IonCol>
            <IonCol class='label location hydrated'>Provider</IonCol>
          </IonRow>
          {allEvents.map((event, index) => (
            <EventRow key={index} event={event} prev={allEvents[index - 1]} />
          ))}
        </IonGrid>
      </div>
    </>
  )
}

_AuditEventsTable.propTypes = {
  report: PropTypes.object.isRequired
}

const AuditEventsTable = withReports(_AuditEventsTable)
export default AuditEventsTable
