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
// `AuditReportList` component
// Loads its own data via redux.
// ------------------------------------
import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList } from '@ionic/react'

import { withReports } from 'store/index'
import { getProviderName } from 'util/providers'
import { printDateTime } from 'util/time'

import SectionHeader from './SectionHeader'

export function AuditReportListItem({ actions, audit }) {
  const slider = useRef(null)

  function onClick() {
    actions.showReport(audit.audit_trip_id)
  }

  function onDelete() {
    slider.current.close()
    actions.deleteReport(audit.audit_trip_id)
  }

  function onReload() {
    slider.current.close()
    actions.loadReport(audit.audit_trip_id, true)
  }

  return (
    <IonItemSliding ref={slider}>
      {/* Swipe to the left to to the left to reload this report */}
      <IonItemOptions side='end'>
        <IonItemOption onClick={onReload}>Reload</IonItemOption>
      </IonItemOptions>

      {/* Swipe to the right to delete this report */}
      <IonItemOptions side='start'>
        <IonItemOption color='danger' onClick={onDelete}>
          Delete
        </IonItemOption>
      </IonItemOptions>

      <IonItem onClick={onClick} class='AuditReportListItem pointed hydrated'>
        <IonLabel>
          <h2>
            {getProviderName(audit.provider_id)} - {audit.provider_vehicle_id}
          </h2>
          <div className='AuditReportListItem-Auditor'>{audit.audit_subject_id}</div>
          <div className='AuditReportListItem-Time'>{printDateTime(audit.recorded)}</div>
        </IonLabel>
      </IonItem>
    </IonItemSliding>
  )
}

AuditReportListItem.propTypes = {
  actions: PropTypes.object.isRequired,
  audit: PropTypes.object.isRequired
}

export function _AuditReportList({ actions, reports }) {
  const { listFilter } = reports
  // Load list once with `effect` hook, updating whenever `listFilter` changes.
  useEffect(() => {
    actions.loadAuditReportList()
  }, [actions, listFilter])

  if (reports.list && reports.list.length) {
    return (
      <IonList class='AuditReportList hydrated'>
        {reports.list.map(audit => (
          <AuditReportListItem key={audit.audit_trip_id} audit={audit} actions={actions} />
        ))}
      </IonList>
    )
  }

  if (reports.list) {
    return <SectionHeader subtitle='No matching reports found' />
  }

  if (reports.listError) {
    return <SectionHeader subtitle='Error loading list of reports' />
  }

  return <SectionHeader subtitle='Loading reports...' />
}

_AuditReportList.propTypes = {
  actions: PropTypes.object.isRequired,
  reports: PropTypes.object.isRequired
}
export default withReports(_AuditReportList)
