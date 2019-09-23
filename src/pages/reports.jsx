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

import _get from 'lodash/get'
import PropTypes from 'prop-types'
import memoize from 'memoize-one'
import React from 'react'
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonMenuButton,
  IonModal,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar
} from '@ionic/react'
import { arrowBack as arrowBackIcon, arrowForward as arrowForwardIcon } from 'ionicons/icons'

import { withReports } from 'store/index'

import AuthPopover from 'components/AuthPopover'
import AuditReportList from 'components/AuditReportList'
import AuditReport from 'components/AuditReport'
import AuditReportListFilter from 'components/AuditReportListFilter'

class _ReportsPage extends React.Component {
  // HACK: The modal will not show (and will never show) on initial component render.
  //       Set a flag so we don't show the modal until component has rendered at least once.
  state = { safeToShow: false }

  componentDidMount() {
    this.setState({ safeToShow: true })
  }

  // Figure out `showNext` and `showPrev` methods based on `selectedTripId`
  getTripActions = memoize((selectedTripId, list, actions) => {
    const results = { showPrev: undefined, showNext: undefined }
    if (selectedTripId && list && list.length) {
      const index = list.findIndex(audit => audit.audit_trip_id === selectedTripId)
      if (index !== -1) {
        const prevId = index === 0 ? null : list[index - 1].audit_trip_id
        if (prevId) results.showPrev = () => actions.showReport(prevId)

        const nextId = index === list.length - 1 ? null : list[index + 1].audit_trip_id
        if (nextId) results.showNext = () => actions.showReport(nextId)
      }
    }
    return results
  })

  render() {
    const { actions, reports } = this.props
    // Get auditTripId from the router params
    const selectedTripId = _get(this.props, 'match.params.auditTripId')
    // Get next/prev action based on selection and list
    const { showNext, showPrev } = this.getTripActions(selectedTripId, reports.list, actions)
    // Show modal if we've already rendered once and there's a selected trip
    const showModal = this.state.safeToShow && !!selectedTripId

    // Refresh the list content
    function refreshList(event) {
      const refresher = event.target
      actions.loadAuditReportList().finally(() => refresher.complete())
    }

    // Refresh an individual report
    function refreshReport(event) {
      const refresher = event.target
      actions.loadReport(selectedTripId, true).finally(() => refresher.complete())
    }

    return (
      <>
        <IonHeader>
          <IonToolbar color='primary'>
            <IonButtons slot='start'>
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Audit Reports</IonTitle>
            <IonButtons slot='end'>
              <AuthPopover />
            </IonButtons>
          </IonToolbar>
          <AuditReportListFilter />
        </IonHeader>

        {/* scrolling content */}
        <IonContent>
          {/* pull-to-refresh */}
          <IonRefresher slot='fixed' onIonRefresh={refreshList}>
            <IonRefresherContent />
          </IonRefresher>
          {/* list content */}
          <AuditReportList />
        </IonContent>

        {/* modal which shows a single report */}
        <IonModal isOpen={showModal} onDidDismiss={actions.showReports}>
          <IonHeader>
            <IonToolbar>
              <IonButtons color='secondary' slot='primary'>
                <IonButton onClick={actions.showReports}>
                  <IonLabel>Done</IonLabel>
                </IonButton>
              </IonButtons>
              <IonButtons slot='secondary'>
                <IonButton key={`${selectedTripId}-prev`} color='secondary' onClick={showPrev} disabled={!showPrev}>
                  <IonIcon icon={arrowBackIcon} />
                </IonButton>
                <IonButton key={`${selectedTripId}-next`} color='secondary' onClick={showNext} disabled={!showNext}>
                  <IonIcon icon={arrowForwardIcon} />
                </IonButton>
              </IonButtons>
              <IonTitle>Audit Report</IonTitle>
            </IonToolbar>
          </IonHeader>
          {/* scrolling content */}
          <IonContent>
            {/* pull-to-refresh */}
            <IonRefresher slot='fixed' onIonRefresh={refreshReport}>
              <IonRefresherContent />
            </IonRefresher>
            {/* report content */}
            <AuditReport auditTripId={selectedTripId} />
          </IonContent>
        </IonModal>
      </>
    )
  }
}

_ReportsPage.propTypes = {
  actions: PropTypes.object.isRequired,
  reports: PropTypes.object.isRequired
}

export default withReports(_ReportsPage)
