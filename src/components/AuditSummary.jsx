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
import { IonCard, IonCardContent, IonCol, IonGrid, IonRow } from '@ionic/react'

import { withReports } from 'store/index'
import { getProviderName } from 'util/providers'
import { printDateTime } from 'util/time'

import { getIssueLabel, getNoteTypeLabel } from './labels'
import { AuditEventPopoverLabel } from './AuditEventPopover'
import EventLocationLink from './EventLocationLink'
import ValueCol from './ValueCol'

import './AuditGrid.scss'
import './AuditSummary.scss'

const LABEL_COLUMN_WIDTH = 3

// Generic
export function LabelValueRow({ label, value }) {
  return (
    <IonRow class='labelValueRow hydrated'>
      <IonCol size={LABEL_COLUMN_WIDTH} class='left label'>
        <b>{label}</b>
      </IonCol>
      <IonCol>{value}</IonCol>
    </IonRow>
  )
}

LabelValueRow.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string
}

// Audit meta-level details
export function AuditHeader({ report }) {
  const { audit } = report
  return (
    <>
      <IonGrid class='AuditGrid hydrated'>
        <LabelValueRow
          label='Vehicle:'
          value={`${getProviderName(audit.trip.provider_id)} - ${audit.trip.provider_vehicle_id}`}
        />
        <LabelValueRow label='Auditor:' value={audit.trip.audit_subject_id} />
        <LabelValueRow label='Audited:' value={printDateTime(audit.audit_start)} />
      </IonGrid>
    </>
  )
}

AuditHeader.propTypes = {
  report: PropTypes.object.isRequired
}

// Events table
export function EventHeader({ report }) {
  return (
    <IonGrid class='AuditGrid hydrated'>
      <IonRow align-items-end class='event header hydrated'>
        <IonCol class='hydrated' size={LABEL_COLUMN_WIDTH} />
        <IonCol class='label hydrated'>
          Time
          <br />
          Accuracy
        </IonCol>
        <IonCol class='label hydrated'>
          Time
          <br />
          Delay
        </IonCol>
        <IonCol class='label hydrated'>
          Location
          <br />
          Accuracy
        </IonCol>
      </IonRow>
      <EventRow event={report.eventMap.trip_start} />
      <EventRow event={report.eventMap.trip_end} />
    </IonGrid>
  )
}

EventHeader.propTypes = {
  report: PropTypes.object.isRequired
}

export function EventRow({ event }) {
  return (
    <IonRow align-items-end key={event.event_type} class='event hydrated'>
      <AuditEventPopoverLabel event={event} as={IonCol} class='left label hydrated' size={LABEL_COLUMN_WIDTH} />
      <ValueCol value={event.time_accuracy} threshold={event.thresholds.time_accuracy} units={'sec'} />
      <ValueCol value={event.time_delay} threshold={event.thresholds.time_delay} units={'sec'} />
      <ValueCol value={event.location_accuracy} threshold={event.thresholds.location_accuracy} units={'m'} />
    </IonRow>
  )
}

EventRow.propTypes = {
  event: PropTypes.object.isRequired
}

// Totals table
export function TotalsHeader({ report }) {
  const { totals } = report
  return (
    <IonGrid class='AuditGrid hydrated'>
      <IonRow align-items-end class='event header hydrated'>
        <IonCol class='hydrated' size={LABEL_COLUMN_WIDTH} />
        <IonCol class='label hydrated'>Trip Distance</IonCol>
        <IonCol class='label hydrated'>Trip Time</IonCol>
      </IonRow>
      <IonRow align-items-end class='event hydrated'>
        <IonCol class='left label hydrated' size={LABEL_COLUMN_WIDTH}>
          Audit
        </IonCol>
        <ValueCol value={totals.audit.distance} units='m' />
        <ValueCol value={totals.audit.time} units='sec' />
      </IonRow>
      <IonRow align-items-end class='event hydrated'>
        <IonCol class='left label hydrated' size={LABEL_COLUMN_WIDTH}>
          Provider
        </IonCol>
        <ValueCol value={totals.provider.distance} units='m' />
        <ValueCol value={totals.provider.time} units='sec' />
      </IonRow>
      <IonRow align-items-end class='event totals hydrated'>
        <IonCol class='left label hydrated' size={LABEL_COLUMN_WIDTH}>
          (delta)
        </IonCol>
        <ValueCol value={totals.deltas.distance} threshold={totals.thresholds.distance_accuracy} units='m' />
        <ValueCol value={totals.deltas.time} threshold={totals.thresholds.time_accuracy} units='sec' />
      </IonRow>
    </IonGrid>
  )
}

TotalsHeader.propTypes = {
  report: PropTypes.object.isRequired
}

export function NotesHeader({ report }) {
  // ignore things that aren't "issues" or don't have "notes"
  const notes = report.audit.auditEvents.filter(event => event.audit_event_type === 'issue' || event.note)
  if (!notes.length) return null
  return (
    <IonGrid class='AuditGrid hydrated'>
      {notes.map((event, index) => (
        <NoteRow key={index} event={event} />
      ))}
    </IonGrid>
  )
}

NotesHeader.propTypes = {
  report: PropTypes.object.isRequired
}

export function NoteRow({ event }) {
  const type = event.audit_event_type
  return (
    <IonRow key={event.audit_event_id} class={`AuditGraph-Note ${type} hydrated`}>
      <IonCol class='left label hydrated' size={LABEL_COLUMN_WIDTH}>
        {getNoteTypeLabel(event)}
      </IonCol>
      <IonCol class='value hydrated'>
        {type === 'issue' && (
          <div className='IssueLabel'>
            <b>{getIssueLabel(event)}</b>
          </div>
        )}
        {!!event.note && <div className='Note'>{event.note}</div>}
        <div className='Date'>{printDateTime(event.timestamp)}</div>
        <div className='Telemetry'>
          <EventLocationLink event={event} missing='(no telemetry)' />
        </div>
      </IonCol>
    </IonRow>
  )
}

NoteRow.propTypes = {
  event: PropTypes.object.isRequired
}

export function TripDetails({ actions, report }) {
  const tripWasStarted = !!(report.eventMap.trip_start.audit || report.eventMap.trip_start.provider)
  if (!tripWasStarted) {
    return (
      <IonGrid class='AuditGrid hydrated'>
        <IonRow align-items-end class='labelValueRow hydrated'>
          <IonCol class='left label hydrated' size={LABEL_COLUMN_WIDTH}>
            Trip:
          </IonCol>
          <IonCol class='value hydrated'>(No actual trip taken)</IonCol>
        </IonRow>
      </IonGrid>
    )
  }
  return (
    <>
      <TotalsHeader actions={actions} report={report} />
      <EventHeader actions={actions} report={report} />
    </>
  )
}

TripDetails.propTypes = {
  actions: PropTypes.object.isRequired,
  report: PropTypes.object.isRequired
}

// Export unwrapped for testing.
export class _AuditSummary extends React.Component {
  render() {
    const { actions, report } = this.props
    // console.info('Showing summary for report:\n', report)
    return (
      <IonCard class='AuditSummary'>
        <IonCardContent>
          <AuditHeader actions={actions} report={report} />
          <TripDetails actions={actions} report={report} />
          <NotesHeader actions={actions} report={report} />
        </IonCardContent>
      </IonCard>
    )
  }
}

_AuditSummary.propTypes = {
  actions: PropTypes.object.isRequired,
  report: PropTypes.object.isRequired
}

// Export wrapped for app consumption.
export default withReports(_AuditSummary)
