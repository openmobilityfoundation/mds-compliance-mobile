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

// Generic text prompt, get a ref to it and call `show()` to show it.
// Calls `onOK` or `onCancel`

import _get from 'lodash/get'
import React from 'react'
import PropTypes from 'prop-types'
import { IonAlert } from '@ionic/react'

export default class PromptDialog extends React.Component {
  static propTypes = {
    cancelText: PropTypes.string,
    defaultValue: PropTypes.string,
    okText: PropTypes.string,
    onCancel: PropTypes.any,
    onOK: PropTypes.func,
    prompt: PropTypes.string,
    title: PropTypes.string
  }

  static defaultProps = {
    title: 'SET props.title',
    prompt: 'SET props.prompt',
    defaultValue: '',
    okText: 'OK',
    // eslint-disable-next-line no-alert
    onOK: () => alert('Pass props.onOK to the prompt'),
    cancelText: 'Cancel',
    onCancel: Function.prototype
  }

  state = { show: false }

  show = () => this.setState({ show: true })

  hide = () => this.setState({ show: false })

  // Events fired by buttons -- set an internal `button` property
  // Fired before `onDismiss()`.
  onOK = () => {
    this.button = 'ok'
  }

  onCancel = () => {
    this.button = 'cancel'
  }

  onDismiss = event => {
    // Ignore event value unless ok button was pressed
    const value = this.button === 'ok' ? _get(event, 'detail.data.values.response') : null
    // Only return value if non-empty (e.g. "" is same as cancel)
    if (value) this.props.onOK(value)
    else this.props.onCancel()

    delete this.button
    this.hide()
  }

  render() {
    const { title, prompt, okText, cancelText, defaultValue } = this.props
    return (
      <IonAlert
        isOpen={this.state.show}
        header={title}
        message={prompt}
        buttons={[
          {
            text: okText,
            handler: this.onOK
          },
          {
            text: cancelText,
            role: 'cancel',
            cssClass: 'secondary',
            handler: this.onCancel
          }
        ]}
        inputs={[
          {
            // value will come back in:  event.detail.data.values.response
            name: 'response',
            type: 'text',
            value: defaultValue
          }
        ]}
        onIonAlertWillDismiss={this.onDismiss}
        onDidDismiss={Function.prototype} // necessary to avoid ionic exception (as of 4.4.0)
      />
    )
  }
}
