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

import { AUDIT_STATE } from 'constants.js'
import { withReports } from 'store'
import { printTime } from 'util/time'

import { AuditEventPopoverLabel } from './AuditEventPopover'
import { getEventLabel } from './labels'
import SectionHeader from './SectionHeader'
import './AuditGraph.scss'

export function Event(report, event, className) {
  const { event_type } = event
  const props = {
    key: `${event_type}-${event.timestamp}`,
    className: `AuditGraph-Event ${className} ${event_type}`,
    style: { top: `${event.top}%` }
  }
  const labelClass = `AuditGraph-Event-Label ${className}`
  let label
  if (report.eventMap[event_type]) {
    label = <AuditEventPopoverLabel as='div' className={labelClass} event={report.eventMap[event_type]} />
  } else if (event_type === AUDIT_STATE.audit_issue) {
    label = <AuditEventPopoverLabel as='div' label='!' className={labelClass} event={event} />
  } else {
    label = <div className={labelClass}>{getEventLabel(event)}</div>
  }
  return (
    <div {...props}>
      <div className={`AuditGraph-Event-Line ${className}`} />
      {label}
    </div>
  )
}

export function Delta(report, delta, actions) {
  const deltaProps = {
    key: delta.timestamp,
    className: `AuditGraph-Delta ${delta.timestamp}`,
    style: {
      top: `calc(${delta.top}% - 2px)`,
      width: delta.location_accuracy,
      left: `calc(50% - ${delta.location_accuracy / 2}px)`
    },
    onClick: actions.toggleDetailsPage
  }
  if (delta.location_accuracy > delta.thresholds.location_accuracy) {
    deltaProps.className = `${deltaProps.className} large`
  }
  return <div {...deltaProps} />
}

// Export unwrapped for testing.
export class _AuditGraph extends React.Component {
  render() {
    const { actions, report } = this.props
    return (
      <div className='AuditGraph'>
        <div className='AuditGraph-Column audit'>
          <SectionHeader title='Audit' />
          <div className='AuditGraph-Marks'>
            {report.audit.telemetryEvents.map(event => Event(report, event, 'telemetry'))}
            {report.audit.vehicleEvents.map(event => Event(report, event, 'vehicle'))}
            {report.audit.auditEvents.map(event => Event(report, event, 'audit'))}
          </div>
        </div>
        <div className='AuditGraph-Column provider'>
          <SectionHeader title='Provider' />
          <div className='AuditGraph-Marks'>
            {report.provider.telemetryEvents.map(event => Event(report, event, 'telemetry'))}
            {report.provider.vehicleEvents.map(event => Event(report, event, 'vehicle'))}
          </div>
        </div>
        <div className='AuditGraph-Deltas'>
          <SectionHeader className='startTime' subtitle={printTime(report.start)} />
          <div className='AuditGraph-Marks'>
            {report.deltas && report.deltas.map(delta => Delta(report, delta, actions))}
          </div>
          <SectionHeader className='endTime' subtitle={printTime(report.end, '(trip end not reported)')} />
        </div>
      </div>
    )
  }
}

_AuditGraph.propTypes = {
  actions: PropTypes.object.isRequired,
  report: PropTypes.object.isRequired
}

// Export wrapped for app consumption.
export default withReports(_AuditGraph)
