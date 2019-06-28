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

// <IonInput> component which calls provided `onChange` method after debounced `delay`.
// Use this to delay updating the redux state while they're actually typing.
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { IonInput } from '@ionic/react'
import useDebouncedCallback from 'use-debounce/lib/callback'

export default function DebouncedInput({ defaultValue, delay = 500, onChange, ...props }) {
  // Store value as they type
  const [value, setValue] = useState(defaultValue)
  // Call `onChange` handler on delay
  const [debouncedOnChange /* , cancel */] = useDebouncedCallback(newValue => onChange(newValue), delay, [])

  const callback = event => {
    const newValue = event.target.value
    setValue(newValue)
    debouncedOnChange(newValue)
  }
  return <IonInput {...props} value={value} onIonChange={callback} clearInput />
}

DebouncedInput.propTypes = {
  defaultValue: PropTypes.any,
  delay: PropTypes.number,
  onChange: PropTypes.any
}
