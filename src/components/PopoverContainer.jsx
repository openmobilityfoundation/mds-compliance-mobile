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

// Generic popover wrapper for IonPopover with `show()` and `hide()` methods
// Won't show children until popover is actually shown.
import React from 'react'
import PropTypes from 'prop-types'
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPopover, IonTitle, IonToolbar } from '@ionic/react'
import { close as closeIcon } from 'ionicons/icons'
import './PopoverContainer.scss'

export default class PopoverContainer extends React.Component {
  state = { show: false, hiding: false }

  show = () => this.setState({ show: true, hiding: false })

  hide = () => {
    this.setState({ show: false, hiding: true })
    setTimeout(() => this.setState({ hiding: false }), 300)
  }

  render() {
    const { title = '', className = '', children, scroll = true } = this.props
    const { show, hiding } = this.state
    return (
      <IonPopover
        cssClass={`PopoverContainer ${className}`}
        isOpen={show}
        onIonPopoverWillDismiss={this.hide}
        onDidDismiss={Function.prototype} // necessary to avoid Ionic error (as of 4.4.0)
      >
        {title && (
          <IonHeader>
            <IonToolbar color='primary'>
              <IonButtons slot='start' />
              <IonTitle>{title}</IonTitle>
              <IonButtons slot='end'>
                <IonButton onClick={this.hide}>
                  <IonIcon icon={closeIcon} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
        )}
        <IonContent scrollY={scroll}>{(show || hiding) && children}</IonContent>
      </IonPopover>
    )
  }
}

PopoverContainer.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  className: PropTypes.string,
  scroll: PropTypes.bool,
  title: PropTypes.string
}
