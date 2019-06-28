/* eslint-disable indent */
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

// ------------------------------------
// `AuditReport` component
// Loads its data via redux
// ------------------------------------
import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { IonLabel, IonSegment, IonSegmentButton } from '@ionic/react'

import { LOAD_STATE, REPORT_DETAILS_PAGE as DETAILS } from 'constants.js'
import { withPage, withReports } from 'store/index'

import AuditEventsTable from 'components/AuditEventsTable'
import AuditGraph from 'components/AuditGraph'
import AuditSummary from 'components/AuditSummary'
import AuditTelemetryTable from 'components/AuditTelemetryTable'
import SectionHeader from 'components/SectionHeader'

import './AuditReport.scss'

export function _AuditReport({ auditTripId, actions, page, reports }) {
  if (!auditTripId) return null

  // Load data in a hook but don't wait for it, we'll pull it from redux once it comes in
  useEffect(() => {
    actions.loadReport(auditTripId)
  }, [auditTripId])

  const report = reports.reports[auditTripId]
  let details
  switch (report) {
    case LOAD_STATE.unloaded:
    case LOAD_STATE.loading:
      return <SectionHeader title='Loading report...' />

    case LOAD_STATE.error:
      return <SectionHeader title='Error loading report' />

    default:
      details = page.reportDetailsPage || DETAILS.graph
      return (
        <div className='AuditReport'>
          <AuditSummary report={report} />
          <div className='AuditReport-details'>
            <div className='AuditReport-segmentContainer'>
              <IonSegment color='secondary'>
                <IonSegmentButton
                  checked={details === DETAILS.graph}
                  onIonSelect={() => actions.showReportDetailsPage(DETAILS.graph)}
                >
                  <IonLabel>Graph</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton
                  checked={details === DETAILS.events}
                  onIonSelect={() => actions.showReportDetailsPage(DETAILS.events)}
                >
                  <IonLabel>Events</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton
                  checked={details === DETAILS.telemetry}
                  onIonSelect={() => actions.showReportDetailsPage(DETAILS.telemetry)}
                >
                  <IonLabel>Telemetry</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </div>
            {details === DETAILS.graph && <AuditGraph report={report} />}
            {details === DETAILS.events && <AuditEventsTable report={report} />}
            {details === DETAILS.telemetry && <AuditTelemetryTable report={report} />}
          </div>
        </div>
      )
  }
}

_AuditReport.propTypes = {
  actions: PropTypes.object.isRequired,
  auditTripId: PropTypes.any,
  reports: PropTypes.any,
  page: PropTypes.any
}

export default withPage(withReports(_AuditReport))
