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
import ProviderSelect from './ProviderSelect'
import DebouncedInput from './DebouncedInput'

import './AuditReportListFilter.scss'

// Export unwrapped for testing.
export class _AuditReportListFilter extends React.Component {
  changeProvider = id => {
    this.props.actions.setListFilterParams({ provider_id: id })
  }

  changeVehicle = provider_vehicle_id => {
    this.props.actions.setListFilterParams({ provider_vehicle_id })
  }

  changeSubject = audit_subject_id => {
    this.props.actions.setListFilterParams({ audit_subject_id })
  }

  render() {
    const { reports } = this.props
    const { listFilter } = reports
    return (
      <div id='AuditReportListFilter'>
        <IonGrid>
          <IonRow align-items-center>
            <IonCol size='4' class='label'>
              Provider:
            </IonCol>
            <IonCol no-padding>
              <ProviderSelect showAny={true} value={listFilter.provider_id} onChange={this.changeProvider} />
            </IonCol>
          </IonRow>
          <IonRow align-items-center>
            <IonCol size='4' class='label'>
              Vehicle ID:
            </IonCol>
            <IonCol no-padding>
              <DebouncedInput
                defaultValue={listFilter.provider_vehicle_id}
                onChange={this.changeVehicle}
                placeholder='Enter Vehicle ID'
              />
            </IonCol>
          </IonRow>
          <IonRow align-items-center>
            <IonCol size='4' class='label'>
              Auditor:
            </IonCol>
            <IonCol no-padding>
              <DebouncedInput
                defaultValue={listFilter.audit_subject_id}
                onChange={this.changeSubject}
                placeholder='Enter auditor email'
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </div>
    )
  }
}

_AuditReportListFilter.propTypes = {
  actions: PropTypes.object.isRequired,
  reports: PropTypes.object.isRequired
}

// Export wrapped for app consumption.
export default withReports(_AuditReportListFilter)
