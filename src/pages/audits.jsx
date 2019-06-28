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

import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonFooter,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonTitle,
  IonToolbar
} from '@ionic/react'

import { withAudit } from 'store/index'
import { getProviderName } from 'util/providers'

import AuthPopover from 'components/AuthPopover'
import IssueSelect from 'components/IssueSelect'
import ProviderSelect from 'components/ProviderSelect'
import TripInfoCard from 'components/TripInfoCard'
import TripEventLog from 'components/TripEventLog'

// Export without wrapping for tests.
export class Page extends React.Component {
  constructor(props) {
    super(props)
    // Ref to ionic scroll element
    this.scroller = React.createRef()
    // Direct pointer to element within `scroller` that actually scrolls
    this.scrollElement = null
  }

  componentDidMount() {
    this.scrollToBottom()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    //    if (!this.scrollElement) this.getScrollElement();
    this.scrollToBottom(snapshot)
  }

  componentWillUnmount() {
    //    delete this.scrollElement;
  }

  scrollToBottom(/* snapshot */) {
    setTimeout(() => {
      const element = this.scroller.current
      if (!element) return null
      // call the `scrolToBottom()` method provided by ionic
      try {
        this.scroller.current.scrollToBottom(300)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Error with scrollToBottom():', e)
      }
      return undefined
    }, 0)
  }

  showReport = () => {
    const { actions, audit } = this.props
    if (audit.auditTripId) actions.showReport(audit.auditTripId)
  }

  changeProvider = id => {
    const props = {
      providerId: id,
      deviceProviderName: getProviderName(id)
    }
    return this.props.actions.setAuditValues(props)
  }

  changeVehicleId = event => {
    return this.props.actions.setAuditValue('providerVehicleId', event.target.value)
  }

  render() {
    const { actions, audit } = this.props
    const { state } = audit
    return (
      <>
        {/* header including trip info card */}
        <IonHeader>
          <IonToolbar color='primary'>
            <IonButtons slot='start'>
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Audit: {_.startCase(state)}</IonTitle>
            <IonButtons slot='end'>
              <AuthPopover />
            </IonButtons>
          </IonToolbar>
          <TripInfoCard />
        </IonHeader>

        {/* scrolling content */}
        <IonContent class={`audit_state ${state} hydrated`} ref={this.scroller}>
          <IonCard class='if-idle'>
            <IonCardContent>
              Enter details about the vehicle to audit:
              <IonItem>
                <IonLabel position='stacked'>Provider:</IonLabel>
                <ProviderSelect value={audit.providerId} onChange={this.changeProvider} />
              </IonItem>
              <IonItem>
                <IonLabel position='stacked'>Test Vehicle ID:</IonLabel>
                <IonInput value={audit.providerVehicleId} onIonInput={this.changeVehicleId} />
              </IonItem>
              <br />
              <IonButton disabled={!audit.providerId || !audit.providerVehicleId} onClick={() => actions.startAudit()}>
                Start Audit
              </IonButton>
            </IonCardContent>
          </IonCard>
          <TripEventLog />
        </IonContent>

        {/* footer */}
        <IonFooter class={`audit_state ${state} hydrated`}>
          {/* footer prompt */}
          <IonCard class='if-audit_start if-trip_start if-trip_end' style={{ marginBottom: 5 }}>
            <IonCardContent class='if-audit_start'>Start trip in provider app then:</IonCardContent>
            <IonCardContent class='if-trip_start'>
              Drive around for a while, end trip in provider app then:
            </IonCardContent>
            <IonCardContent class='if-trip_end'>Enter any issues or notes then:</IonCardContent>
          </IonCard>

          {/* footer buttons */}
          <IonToolbar class='if-not-idle'>
            <IonButtons slot='start'>
              <IonButton class='if-audit_start' color='secondary' onClick={() => actions.startTrip()}>
                Trip Started
              </IonButton>
              {!audit.issueLogged && (
                <IonButton class='if-audit_start' onClick={() => actions.cancelAudit()}>
                  Cancel
                </IonButton>
              )}
              {audit.issueLogged && (
                <IonButton class='if-audit_start' onClick={() => actions.endAudit()}>
                  End Audit
                </IonButton>
              )}
              <IonButton class='if-trip_start' color='secondary' onClick={() => actions.endTrip()}>
                Trip Ended
              </IonButton>
              <IonButton class='if-trip_end' color='secondary' onClick={() => actions.endAudit()}>
                Complete Audit
              </IonButton>
              <IonButton class='if-audit_end' color='secondary' onClick={() => actions.completeAudit()}>
                Done
              </IonButton>
              <IonButton class='if-audit_end' onClick={this.showReport}>
                Show Report
              </IonButton>
              <IonButton class='if-trip_start' onClick={() => actions.sendTelemetry()}>
                Telemetry
              </IonButton>
            </IonButtons>
            <IonButtons slot='end'>
              <IssueSelect />
            </IonButtons>
          </IonToolbar>
        </IonFooter>
      </>
    )
  }
}

Page.propTypes = {
  actions: PropTypes.object.isRequired,
  audit: PropTypes.object.isRequired
}

// Export with audit wrapper for browser use.
export default withAudit(Page)
