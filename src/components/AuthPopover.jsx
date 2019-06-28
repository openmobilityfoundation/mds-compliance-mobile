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
import { IonButtons, IonButton, IonCol, IonGrid, IonRow, IonToolbar } from '@ionic/react'

import { withAuth } from 'store/index'

import PopoverContainer from './PopoverContainer'
import AuthAvatar from './AuthAvatar'
import './AuthPopover.scss'

export function _AuthPopover(props) {
  const popover = useRef(null)
  const showPopover = () => popover.current && popover.current.show()
  const hidePopover = () => popover.current && popover.current.hide()

  const { auth = {}, actions } = props
  if (!auth || !auth.profile) return null

  const { profile } = auth
  return (
    <>
      <AuthAvatar profile={profile} onClick={showPopover} />
      <PopoverContainer ref={popover} className='AuthPopover' scroll={false}>
        <IonGrid>
          <IonRow>
            <IonCol align-self-center size='2'>
              <AuthAvatar profile={profile} onClick={showPopover} />
            </IonCol>
            <IonCol align-self-center>
              <div className='nickname'>{auth.profile.nickname}</div>
              <div className='email'>{auth.profile.email}</div>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonToolbar no-border>
          <IonButtons slot='start'>
            <IonButton onClick={actions.logout}>Log Out</IonButton>
          </IonButtons>
          <IonButtons slot='end'>
            <IonButton color='secondary' onClick={hidePopover}>
              Done
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </PopoverContainer>
    </>
  )
}

_AuthPopover.propTypes = {
  actions: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
}

export default withAuth(_AuthPopover)
