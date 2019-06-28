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
import { IonCol, IonGrid, IonIcon, IonRow } from '@ionic/react'

import { AUDIT_STATE, QUEUE_STATE } from 'constants.js'
import { withAudit } from 'store/index'
import { printTime } from 'util/time'

import EventLocationLink from './EventLocationLink'
import { getEventLabel, getIssueTitle } from './labels'
import './TripEventLog.scss'

function statusIcon(event) {
  const { status } = event
  switch (status) {
    case QUEUE_STATE.ready:
      return 'md-radio-button-off'
    case QUEUE_STATE.telemetry:
      return 'md-locate'
    case QUEUE_STATE.in_flight:
      return 'md-cloud-circle'
    case QUEUE_STATE.submitted:
      return 'md-happy'
    case QUEUE_STATE.skipped:
      return 'md-locate'
    case QUEUE_STATE.error:
      return 'md-alert'
    default:
      return 'none' // Will see this for pre-loaded trip.
  }
}

export function EventRow({ event }) {
  const telemetryMissing = event.status === QUEUE_STATE.telemetry ? '(getting telemetry)' : '(no telemetry)'
  return (
    <IonRow data-event={event.eventId} class={`eventRow ${event.status} ellipsized hydrated`}>
      {event.status === 'skipped' && <IonCol size='12' class='strikethrough hydrated' />}
      <IonCol size='7' size-sm='7' size-md='6' class='ellipsized hydrated'>
        <IonIcon name={statusIcon(event)} />
        <span className='timestamp'>{printTime(event.params.timestamp || event.timestamp)}</span>
        <span className='event'>{getEventLabel(event)}</span>
      </IonCol>
      <IonCol class='telemetry hint ellipsized hydrated'>
        <EventLocationLink event={event} missing={telemetryMissing} />
      </IonCol>
      {event.type === AUDIT_STATE.audit_issue && (
        <IonCol size='12' class='issueCol hydrated'>
          <span className='issue'>
            {getIssueTitle(event.params)}
            {event.params.note ? `: ${event.params.note}` : null}
          </span>
        </IonCol>
      )}
    </IonRow>
  )
}

EventRow.propTypes = {
  event: PropTypes.object.isRequired
}

// Pre-load icons to avoid visual bugs when browser goes offline.
const ICON_LOADER = (
  <div style={{ width: 0, height: 0, overflow: 'hidden' }}>
    <IonIcon name='md-radio-button-off' />
    <IonIcon name='md-locate' />
    <IonIcon name='md-cloud-circle' />
    <IonIcon name='md-happy' />
    <IonIcon name='md-alert' />
  </div>
)

// Export unwrapped for testing.
export class _TripEventLog extends React.Component {
  render() {
    const { audit } = this.props
    const { auditLog } = audit
    return (
      <>
        {ICON_LOADER}
        <IonGrid class='eventLog hydrated'>
          {auditLog.map(event => (
            <EventRow key={event.eventId} event={event} />
          ))}
        </IonGrid>
      </>
    )
  }
}

_TripEventLog.propTypes = {
  audit: PropTypes.object.isRequired
}

// Export wrapped for app consumption.
export default withAudit(_TripEventLog)
