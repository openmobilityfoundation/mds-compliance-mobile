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

import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { IonButton, IonSelect, IonSelectOption } from '@ionic/react'

import { withAudit } from 'store/index'
import { ISSUE_LABELS } from './labels'
import PromptDialog from './PromptDialog'

// Create issue options statically (since they don't change)
const issueOptions = Object.keys(ISSUE_LABELS).map(key => (
  <IonSelectOption key={key} value={key}>
    {ISSUE_LABELS[key]}
  </IonSelectOption>
))

export function IssueSelect(props) {
  const select = useRef(null)
  const prompt = useRef(null)

  const { actions, buttonTitle = 'Report Issue' } = props

  // When the select changes, return `key`
  function onSelectChanged(event) {
    const reason = event.target.value
    if (!reason) return

    if (reason === 'oth_user_reported') {
      prompt.current.show()
    } else {
      actions.createAuditIssue(reason)
    }

    // Clear the value so it's not selected next time
    // This will trigger another `onSelectChanged` with empty reason
    //  which will exit on its own.
    select.current.value = null
  }

  function onPromptOK(note) {
    const reason = 'oth_user_reported'
    return actions.createAuditIssue(reason, note)
  }

  return (
    <>
      <IonButton onClick={() => select.current.open()}>{buttonTitle}</IonButton>
      <IonSelect
        value={null}
        ref={select}
        onIonChange={onSelectChanged}
        style={{ display: 'none' }}
        interface='action-sheet'
        interfaceOptions={{ header: 'Enter error reason:' }}
      >
        {issueOptions}
      </IonSelect>
      <PromptDialog ref={prompt} title='Other error' prompt='Enter error description' onOK={onPromptOK} />
    </>
  )
}

IssueSelect.propTypes = {
  actions: PropTypes.object.isRequired,
  buttonTitle: PropTypes.string
}

export default withAudit(IssueSelect)
