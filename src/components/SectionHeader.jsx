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

// Generic message display, e.g. for loading or load error.
import React from 'react'
import PropTypes from 'prop-types'

import './SectionHeader.scss'

export default function SectionHeader({ title, subtitle, className = '', style }) {
  return (
    <div className={`SectionHeader ${className}`} style={style}>
      {title && <h3>{title}</h3>}
      {subtitle && <h4>{subtitle}</h4>}
    </div>
  )
}

SectionHeader.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  subtitle: PropTypes.string,
  title: PropTypes.string
}
