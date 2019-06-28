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
import { getEventCoords } from 'util/events'

export default function EventLocationLink({ event = {}, missing = '(no telemetry)', multiline = false }) {
  const coords = getEventCoords(event)
  if (!coords) return <span className='EventLocationLink missing'>{missing}</span>

  const url = `https://www.google.com/maps/search/?api=1&query=${coords.lat}%2C${coords.lng}`

  // display with 4 digits of precision
  const lat = coords.lat.toFixed(4)
  const lng = coords.lng.toFixed(4)

  const style = {
    color: '#002E6d',
    textDecoration: 'none'
  }
  if (multiline) {
    style.display = 'inline-block'
    style.textAlign = 'right'
  }

  return (
    <a href={url} target='_blank' rel='noopener noreferrer' className='EventLocationLink' style={style}>
      {lat}
      {multiline ? <br /> : ', '}
      {lng}
    </a>
  )
}

EventLocationLink.propTypes = {
  event: PropTypes.object,
  missing: PropTypes.string,
  multiline: PropTypes.bool
}
