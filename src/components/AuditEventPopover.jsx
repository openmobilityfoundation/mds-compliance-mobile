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
import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { IonCol, IonContent, IonGrid, IonRow } from '@ionic/react'

import { AUDIT_STATE } from 'constants.js'
import { printTime, printDateTime } from 'util/time'

import EventLocationLink from './EventLocationLink'
import PopoverContainer from './PopoverContainer'
import ValueCol from './ValueCol'

import { getEventLabel, getIssueLabel } from './labels'

import './AuditGrid.scss'
import './AuditEventPopover.scss'

const LABEL_COLUMN_WIDTH = 3

// Use this to render a label to show AuditEvent details for `event` when the label is clicked.
// Contents of the label will be the nice event name.
export function AuditEventPopoverLabel(props) {
  const { event, as = 'div', label = getEventLabel(event), ...wrapperProps } = props
  const popover = useRef(null)
  if (!event) return null

  // add onClick method to props to show the popover
  wrapperProps.onClick = e => {
    e.stopPropagation()
    if (popover.current) popover.current.show()
  }

  const contents =
    event.event_type === AUDIT_STATE.audit_issue ? (
      <IssueEventContents event={event} />
    ) : (
      <VehicleEventContents event={event} />
    )

  return (
    <>
      {React.createElement(as, wrapperProps, label)}
      <PopoverContainer ref={popover} title={getEventLabel(event)} className='AuditEventPopover'>
        {contents}
      </PopoverContainer>
    </>
  )
}

AuditEventPopoverLabel.propTypes = {
  as: PropTypes.elementType,
  event: PropTypes.object.isRequired,
  label: PropTypes.string
}

export function IssueEventContents({ event }) {
  return (
    <IonContent scrollY={false}>
      <IonGrid class='AuditGrid hydrated'>
        <IonRow>
          <IonCol class='left label hydrated' size={LABEL_COLUMN_WIDTH}>
            Issue:
          </IonCol>
          <IonCol class='value hydrated'>{getIssueLabel(event)}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol class='left label hydrated' size={LABEL_COLUMN_WIDTH}>
            Reported:
          </IonCol>
          <IonCol class='value hydrated'>{printDateTime(event.timestamp)}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol class='left label hydrated' size={LABEL_COLUMN_WIDTH}>
            At:
          </IonCol>
          <IonCol class='value hydrated'>
            <EventLocationLink event={event} />
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol class='left label hydrated' size={LABEL_COLUMN_WIDTH}>
            By:
          </IonCol>
          <IonCol class='value hydrated'>{event.audit_subject_id}</IonCol>
        </IonRow>
        {event.note && (
          <IonRow>
            <IonCol class='left label hydrated' size={LABEL_COLUMN_WIDTH}>
              Note:
            </IonCol>
            <IonCol class='value hydrated'>{event.note}</IonCol>
          </IonRow>
        )}
      </IonGrid>
    </IonContent>
  )
}

IssueEventContents.propTypes = {
  event: PropTypes.object.isRequired
}

// Contents of the popover for vehicle_events, which will be matched to both providers.
export function VehicleEventContents({ event }) {
  const { audit = {}, provider = {}, thresholds } = event
  return (
    <>
      <IonContent scrollY={false}>
        <IonGrid class='AuditGrid hydrated'>
          <IonRow class='event header hydrated'>
            <IonCol size={LABEL_COLUMN_WIDTH} class='hydrated' />
            <IonCol class='label hydrated'>Audit</IonCol>
            <IonCol class='label hydrated'>Provider</IonCol>
            <IonCol class='label hydrated'>Difference</IonCol>
          </IonRow>
          <IonRow class='event hydrated'>
            <IonCol size={LABEL_COLUMN_WIDTH} class='left label hydrated'>
              Time:
            </IonCol>
            <IonCol>{printTime(audit.timestamp, '(not sent)')}</IonCol>
            <IonCol>{printTime(provider.timestamp, '(not sent)')}</IonCol>
            <ValueCol value={event.time_accuracy} threshold={thresholds.time_accuracy} units={'s'} />
          </IonRow>
          <IonRow class='event hydrated'>
            <IonCol size={LABEL_COLUMN_WIDTH} class='left label hydrated'>
              Recorded:
            </IonCol>
            <IonCol>{printTime(audit.timestamp, '(not sent)')}</IonCol>
            <IonCol>{printTime(provider.timestamp, '(not sent)')}</IonCol>
            <ValueCol value={event.recorded_accuracy} threshold={thresholds.time_delay} units={'s'} />
          </IonRow>
          <IonRow class='event hydrated'>
            <IonCol size={LABEL_COLUMN_WIDTH} class='left label hydrated'>
              Location:
            </IonCol>
            <IonCol>
              <EventLocationLink event={audit} missing='(not sent)' multiline />
            </IonCol>
            <IonCol>
              <EventLocationLink event={provider} missing='(not sent)' multiline />
            </IonCol>
            <ValueCol value={event.location_accuracy} threshold={thresholds.location_accuracy} units={'m'} />
          </IonRow>
        </IonGrid>
        <br />
      </IonContent>
    </>
  )
}
VehicleEventContents.propTypes = {
  event: PropTypes.object.isRequired
}
