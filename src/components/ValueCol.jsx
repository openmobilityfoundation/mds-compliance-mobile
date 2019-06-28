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
// Display numeric value and associated units.
// ------------------------------------

import React from 'react'
import PropTypes from 'prop-types'
import { IonCol } from '@ionic/react'

export default function ValueCol({ value, threshold, units, className = '', missing = '(N/A)', ...props }) {
  if (Number.isNaN(value) || value == null) {
    return <IonCol class={`value missing ${className} hydrated`}>{missing}</IonCol>
  }

  const valid = !threshold || Math.floor(value) <= threshold ? 'valid' : 'invalid'
  let label = Math.floor(value)
  if (units) {
    // If only one letter long, snug up to value
    if (units.length === 1) {
      label = `${label}${units}`
    }
    // otherwise put a space between
    else {
      label = `${label} ${units}`
    }
  }
  return (
    <IonCol class={`value ${valid} ${className} hydrated`} {...props}>
      {label}
    </IonCol>
  )
}

ValueCol.propTypes = {
  className: PropTypes.string,
  missing: PropTypes.string,
  threshold: PropTypes.number,
  units: PropTypes.string,
  value: PropTypes.number
}
