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
import { IonSelect, IonSelectOption } from '@ionic/react'

import { getActiveProviders } from 'util/providers'

// Create provider options statically (since they don't change)
const providerOptions = getActiveProviders().map(provider => (
  <IonSelectOption key={provider.id} value={provider.id}>
    {provider.provider_name}
  </IonSelectOption>
))

// Provider options with "Any" item at the start
const providerOptionsAny = [
  <IonSelectOption key='any' value={null}>
    All Providers
  </IonSelectOption>,
  ...providerOptions
]

export default function ProviderSelect({ showAny = false, onChange, ...props }) {
  // When the select changes, returns provider `id``
  function onSelectChanged(event) {
    const id = event.target.value
    if (!id) return onChange(null)
    return onChange(id)
  }

  const options = showAny ? providerOptionsAny : providerOptions
  return (
    <IonSelect onIonChange={onSelectChanged} interface='action-sheet' {...props}>
      {options}
    </IonSelect>
  )
}

ProviderSelect.propTypes = {
  onChange: PropTypes.func.isRequired,
  showAny: PropTypes.bool
}
