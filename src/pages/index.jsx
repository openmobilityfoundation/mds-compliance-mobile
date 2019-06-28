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
// Export pages / routes / etc
// Load from this file!
// ------------------------------------
import React from 'react'
import { Route, Switch } from 'react-router-dom'

// Load all pages here
import MapPage from 'pages/map'
import AuditPage from 'pages/audits'
import ReportsPage from 'pages/reports'

// Map all pages for menu
export const pages = [
  { title: 'Map', path: '/map', icon: 'map' },
  { title: 'Audit', path: '/', icon: 'bicycle' },
  { title: 'Reports', path: '/reports', icon: 'filing' }
]

// Routes, nested inside an `IonPage
export function AppRoutes() {
  return (
    <Switch>
      <Route path='/map' component={MapPage} />
      <Route path='/audit' component={AuditPage} />
      <Route path='/reports' component={ReportsPage} />
      <Route path='/report/:auditTripId' component={ReportsPage} />
      <Route path='/' component={AuditPage} />
    </Switch>
  )
}
