/* eslint-disable no-param-reassign, no-console */
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
// `AuditReport` object -- hand it a raw audit trip report from the MDS-Audit service
//  and it will normalize things for display, including calculating whether certain trip events
//  are within specified tolerances.
// ------------------------------------

import keyBy from 'lodash/keyBy'
import min from 'lodash/min'
import max from 'lodash/max'
import sortBy from 'lodash/sortBy'
import cheapRuler from 'cheap-ruler'

import { getConfigPaths } from 'config'
import { AUDIT_STATE } from 'constants.js'
import { getEventDistance, getEventTripDistance } from 'util/events'
import { getPercent } from 'util/math'
import { getTimeDelta } from 'util/time'

const config = getConfigPaths({
  thresholds: 'apps.compliance.thresholds',
  telemetryMatchTime: 'apps.compliance.thresholds.telemetry.matchTime'
})

function isValidTimestamp(timestamp) {
  if (typeof timestamp !== 'number') return false
  const date = new Date(timestamp)
  if (Number.isNaN(date)) return false
  return true
}

export default class AuditReport {
  constructor(v2Report) {
    const { events: allAuditEvents, provider: providerRaw, ...trip } = v2Report
    const audit = {
      trip,
      auditEvents: [],
      vehicleEvents: [],
      telemetryEvents: [],
      eventMap: {} // audit + vehicle events keyed by (generated) event_type
    }
    this.audit = audit
    const provider = {
      device: (providerRaw && providerRaw.device) || {},
      vehicleEvents: (providerRaw && providerRaw.events) || [],
      telemetryEvents: (providerRaw && providerRaw.telemetry) || [],
      eventMap: {} // vehicle events keyed by event_type
    }
    this.provider = provider

    // Split / normalize audit events
    allAuditEvents.forEach(({ ...event }) => {
      event.domain = 'audit'
      const { audit_event_type } = event
      switch (audit_event_type) {
        case 'telemetry':
          event.type = 'telemetry'
          event.event_type = 'telemetry'
          audit.telemetryEvents.push(event)
          break

        case 'start':
        case 'end':
        case 'issue':
        case 'note':
          event.type = 'audit'
          event.event_type = `audit_${audit_event_type}`
          audit.auditEvents.push(event)
          break

        default:
          event.type = 'vehicle'
          event.event_type = audit_event_type
          audit.vehicleEvents.push(event)
          // add to telemetry table as well for timeline comparison
          if (event.gps) {
            audit.telemetryEvents.push({ ...event, type: 'telemetry', event_type: 'telemetry' })
          }
      }
    })
    sortBy(audit.auditEvents, 'timestamp')
    sortBy(audit.vehicleEvents, 'timestamp')
    sortBy(audit.telemetryEvents, 'timestamp')
    // Events by event_type.  Note this will always take the last event if more than one of type.
    audit.eventMap = keyBy([...audit.auditEvents, ...audit.vehicleEvents], 'event_type')
    // start/end timestamps
    audit.audit_start = audit.eventMap.audit_start && audit.eventMap.audit_start.timestamp
    audit.trip_start = audit.eventMap.trip_start && audit.eventMap.trip_start.timestamp
    audit.trip_end = audit.eventMap.trip_end && audit.eventMap.trip_end.timestamp
    audit.audit_end = audit.eventMap.audit_end && audit.eventMap.audit_end.timestamp

    // Normalize provider vehicle events
    // Also adds telemetry data to `provider.vehicleEvents` according to `provider.telemetryEvents`
    const telemetryMap = keyBy(provider.telemetryEvents, 'timestamp')
    provider.vehicleEvents = provider.vehicleEvents.map(({ ...event }) => {
      event.domain = 'provider'
      const telemetry = telemetryMap[event.telemetry_timestamp] || telemetryMap[event.timestamp]
      if (telemetry) {
        event.gps = telemetry.gps
      }
      return event
    })
    provider.telemetryEvents = provider.telemetryEvents.map(event => {
      return { ...event, domain: 'provider' }
    })
    sortBy(provider.vehicleEvents, 'timestamp')
    sortBy(provider.telemetryEvents, 'timestamp')
    // Events by event_type.  Note this will always take the last event if more than one of type.
    provider.eventMap = keyBy(provider.vehicleEvents, 'event_type')
    // start/end timestamps
    provider.trip_start = provider.eventMap.trip_start && provider.eventMap.trip_start.timestamp
    provider.trip_end = provider.eventMap.trip_end && provider.eventMap.trip_end.timestamp

    // logical audit start/end time
    const start = min([audit.audit_start, audit.trip_start, provider.trip_start])
    if (isValidTimestamp(start)) this.start = start

    const end = max([audit.audit_end, audit.trip_end, provider.trip_end])
    if (isValidTimestamp(end)) this.end = end
    this.duration = this.end - this.start

    // Figure out "top" of all audit/vehicle events according to start/end
    // This is where we'll render the event in the event graph
    const setTop = event => {
      if (event.timestamp) event.top = getPercent(event.timestamp, this.start, this.end)
    }
    audit.auditEvents.forEach(setTop)
    audit.vehicleEvents.forEach(setTop)
    audit.telemetryEvents.forEach(setTop)
    provider.vehicleEvents.forEach(setTop)
    provider.telemetryEvents.forEach(setTop)

    // All significant events sorted together by timestamp, for "events" tab of report UI
    this.allEvents = sortBy([...audit.auditEvents, ...audit.vehicleEvents, ...provider.vehicleEvents], 'timestamp')

    // create a `cheapRuler` according to the `trip_start` latitude
    const tripStartTelemetry =
      (provider.eventMap.trip_start && provider.eventMap.trip_start.gps) ||
      (audit.eventMap.trip_start && audit.eventMap.trip_start.gps)
    const ruler = tripStartTelemetry ? cheapRuler(tripStartTelemetry.lat, 'meters') : null
    // attempt to match telemetry data between the two trips
    // NOTE: we only get data if we have a `ruler`
    this.deltas = this._matchTelemetry(ruler)

    // Match certain audit and trip events
    this.eventMap = {
      trip_start: this._evaluateVehicleEvent(ruler, 'trip_start'),
      trip_end: this._evaluateVehicleEvent(ruler, 'trip_end')
    }
    // Get totals for audit vs provider
    this.totals = {
      audit: {
        distance: getEventTripDistance(ruler, audit.telemetryEvents, this.start, this.end),
        time: getTimeDelta(audit.trip_start, audit.trip_end)
      },
      provider: {
        distance: getEventTripDistance(ruler, provider.telemetryEvents, this.start, this.end),
        time: getTimeDelta(provider.trip_start, provider.trip_end)
      },
      deltas: {},
      thresholds: config.thresholds.totals
    }
    this.totals.deltas.distance = Math.abs(this.totals.audit.distance - this.totals.provider.distance)
    this.totals.deltas.time = Math.abs(this.totals.audit.time - this.totals.provider.time)

    console.group(`Audit trip: ${audit.trip.audit_trip_id}`)
    console.info('raw:', v2Report)
    console.info('normalized:', this)
    console.groupEnd()
  }

  // Evaluate the `provider` and `audit` events of the same `eventType`
  _evaluateVehicleEvent(ruler, eventType) {
    const provider = this.provider.eventMap[eventType]
    const audit = this.audit.eventMap[eventType]
    const event = {
      type: eventType,
      audit,
      provider
    }
    this._addEventCalculations(ruler, event, eventType)
    return event
  }

  // Add event calculations for a specific `event`.
  // Also adds pass/fail thresholds to the events, which can vary by event type.
  // The thresholds come from the app config.
  _addEventCalculations(ruler, event, eventType) {
    const { provider, audit } = event
    if (provider && audit) {
      event.time_accuracy = getTimeDelta(audit.timestamp, provider.timestamp)
      event.recorded_accuracy = getTimeDelta(audit.recorded, provider.recorded)
      event.time_delay = getTimeDelta(provider.timestamp, provider.recorded)
      event.location_accuracy = getEventDistance(ruler, audit, provider)
    }
    if (event.timestamp) event.top = this.getTop(event.timestamp)

    // Add thresholds according to eventType
    if (eventType === 'trip_start' || eventType === 'trip_end') {
      event.thresholds = config.thresholds.startEnd
    } else if (eventType === 'trip_enter' || eventType === 'trip_leave') {
      event.thresholds = config.thresholds.enterLeave
    } else {
      event.thresholds = config.thresholds.other
    }

    return event
  }

  // Match audit `timestamps` with `provider` timestamps.
  // Returns a map of `deltas`.
  _matchTelemetry(ruler) {
    const deltas = []
    if (!ruler) return deltas

    const audit = this.audit.telemetryEvents
    const provider = this.provider.telemetryEvents
    if (!audit.length || !provider.length) return undefined
    // merge lists and sort by timestamp
    const all = sortBy([...audit, ...provider], 'timestamp')

    // find edges where we switch from one to the other
    const filtered = all.filter(
      (event, index) => event.gps.lat && (!all[index - 1] || event.domain !== all[index - 1].domain)
    )
    // Match edges which have timestamps within 10 seconds of each other
    const matchDelta = config.telemetryMatchTime * 1000
    const matched = []
    for (let i = 1; i < filtered.length; i += 2) {
      const event = filtered[i]
      // get prev + next events and deltas between those and the `event`
      const prev = filtered[i - 1]
      const prevDelta = Math.abs(event.timestamp - prev.timestamp)
      const next = filtered[i + 1]
      const nextDelta = next ? Math.abs(event.timestamp - next.timestamp) : Infinity
      // Use event with the smaller time difference
      // but only if within specified time delta
      if (prevDelta < nextDelta && prevDelta <= matchDelta) {
        matched.push([event, prev])
      } else if (nextDelta <= matchDelta) {
        matched.push([event, next])
      }
    }

    // break into groups of 2 and figure out distance, attaching `delta` to the both records
    matched.forEach(([event1, event2]) => {
      const event = {
        type: AUDIT_STATE.telemetry,
        audit: event1.domain === 'audit' ? event1 : event2,
        provider: event1.domain === 'audit' ? event2 : event1,
        // display at the average of the two times
        timestamp: Math.ceil((event1.timestamp + event2.timestamp) / 2)
      }
      this._addEventCalculations(ruler, event, 'telemetry')
      deltas.push(event)
    })

    return deltas
  }

  // ------------------------------------
  // Utility methods
  // ------------------------------------

  // Return the top coordinate for our timestamp as a percentage from `0...100`
  getTop(timestamp) {
    return getPercent(timestamp, this.start, this.end)
  }
}
