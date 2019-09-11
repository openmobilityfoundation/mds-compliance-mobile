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
import mapboxgl from 'mapbox-gl'

import { getConfigPaths } from 'config'
import { withAuth } from 'store/index'
import { getVehicles } from 'services/api'
import { vehiclesToPoints } from 'util/geo'

import 'mapbox-gl/dist/mapbox-gl.css'

// Get config data we'll use below.  Throws if path values are undefined.
const config = getConfigPaths({
  mapboxSettings: 'apps.compliance.mapbox.settings',
  deviceFetchFrequency: 'apps.compliance.pages.map.deviceFetchFrequency'
})

/**
 * Map experience for exploring and selecting nearby vehicles
 * Selecting a device zooms the map to that location
 */
class FindNearbyDeviceMap extends React.Component {
  static propTypes = {
    auth: PropTypes.object.isRequired,
    mapID: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
    providerId: PropTypes.string, // Restrict to this provide if defined
    style: PropTypes.string.isRequired,
    center: PropTypes.array.isRequired,
    zoom: PropTypes.number,
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,
    initialZoom: PropTypes.number,
    vehicles: PropTypes.object,
    onHover: PropTypes.func,
    onSelect: PropTypes.func
  }

  static defaultProps = {
    mapID: 'map',
    vehicles: null,
    ...config.mapboxSettings
  }

  // Initial state
  state = {
    mapLoaded: false,
    // All vehicles returned from last query as a raw array of vehicles.
    // See `componentDidUpdate()`
    vehicles: null,
    // Currently hovered device.
    hovDevice: null,
    // Currently selected device.
    selDevice: null
  }

  componentDidMount() {
    mapboxgl.accessToken = this.props.token

    this.map = new mapboxgl.Map({
      container: this.props.mapID,
      style: this.props.style,
      center: this.props.center,
      zoom: this.props.initialZoom,
      minZoom: this.props.minZoom,
      maxZoom: this.props.maxZoom,
      attributionControl: false
    }).addControl(new mapboxgl.AttributionControl({ compact: true }))

    this.map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      })
    )

    this.map.on('load', this.onMapLoad)
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.mapLoaded) return

    if (
      !this.vehiclesLoaded ||
      this.state.vehicles !== prevState.vehicles ||
      this.props.providerId !== prevProps.providerId
    ) {
      // Filter by providerId if necessary
      let { vehicles } = this.state
      // convert to featureCollection to pass into map
      const featureCollection = vehicles && vehiclesToPoints(vehicles)
      this.map.getSource('devices').setData(featureCollection)
      this.vehiclesLoaded = true
    }

    if (this.vehiclesLoaded && !this.getVehiclesInterval) {
      this.startGetVehiclesUpdate()
    }

    // Point hover highlight
    if (prevState.hovDevice !== this.state.hovDevice) {
      // Highlight hovered device unless already selected
      if (this.state.hovDevice && !this.state.selDevice) {
        this.map.setFilter('device-point-hover', ['all', ['==', ['get', 'device_id'], this.state.hovDevice]])
        this.map.setLayoutProperty('device-point-hover', 'visibility', 'visible')
        this.map.setPaintProperty('device-point-hover', 'circle-stroke-opacity', 0.45)
      } else {
        // Unhighlight hovered device
        this.map.setLayoutProperty('device-point-hover', 'visibility', 'none')
        this.map.setFilter('device-point-hover', ['all'])
        this.map.setPaintProperty('device-point-hover', 'circle-stroke-opacity', 0)
      }
    }

    // Point select highlight
    if (prevState.selDevice !== this.state.selDevice) {
      if (this.state.selDevice) {
        // Highlight selected
        this.map.setFilter('device-point-select', ['all', ['==', ['get', 'device_id'], this.state.selDevice]])
        this.map.setLayoutProperty('device-point-select', 'visibility', 'visible')
        this.map.setPaintProperty('device-point-select', 'circle-stroke-opacity', 0.45)
        // Clear any hover, not DRY
        this.map.setLayoutProperty('device-point-hover', 'visibility', 'none')
      } else {
        // Unhighlight selected
        this.map.setLayoutProperty('device-point-select', 'visibility', 'none')
        this.map.setFilter('device-point-select', ['all'])
        this.map.setPaintProperty('device-point-select', 'circle-stroke-opacity', 0)
      }
    }
  }

  componentWillUnmount() {
    this.unmounted = true
    this.stopGetVehiclesUpdate()
    this.map.remove()
  }

  getVehicles = async () => {
    const {
      providerId,
      auth: { accessToken }
    } = this.props
    const bbox = this.bbox && JSON.stringify(this.bbox.toArray())
    if (!bbox) return

    const response = await getVehicles(bbox, providerId, accessToken)
    if (!response || !response.vehicles || this.unmounted) return

    this.setState({ vehicles: response.vehicles })
  }

  startGetVehiclesUpdate() {
    this.getVehiclesInterval = setInterval(this.getVehicles, config.deviceFetchFrequency)
  }

  stopGetVehiclesUpdate() {
    clearInterval(this.getVehiclesInterval)
  }

  onMapLoad = () => {
    // Set initital map bounds
    this.bbox = this.map.getBounds()

    // Load vehicles according to the bbox above
    this.getVehicles()

    this.map.addSource('devices', {
      type: 'geojson',
      data: null
    })

    this.map.addLayer({
      type: 'circle',
      source: 'devices',
      id: 'devices',
      layout: {},
      paint: {
        'circle-color': [
          'case',
          ['==', ['get', 'state'], 'available'],
          'hsl(104, 76%, 48%)',
          ['==', ['get', 'state'], 'inactive'],
          'red',
          ['==', ['get', 'state'], 'reserved'],
          '#dbdb1a',
          ['==', ['get', 'state'], 'trip'],
          '#dbdb1a',
          ['rgba', 0, 0, 0, 1]
        ],
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 10, 1, 13, 6, 15, 8, 20, 10],
        'circle-opacity': 1,
        'circle-stroke-width': 1,
        'circle-stroke-color': 'hsl(0, 0%, 100%)'
      }
    })

    this.map.addLayer({
      type: 'symbol',
      source: 'devices',
      id: 'devices-point-label',
      layout: {
        'text-field': [
          'case',
          ['==', ['get', 'state'], 'available'],
          'A',
          ['==', ['get', 'state'], 'inactive'],
          'I',
          ['==', ['get', 'state'], 'reserved'],
          'R',
          ['==', ['get', 'state'], 'trip'],
          'T',
          ''
        ],
        'text-size': 12,
        'text-font': ['Montserrat ExtraBold', 'Arial Unicode MS Regular']
      },
      paint: {
        'text-color': '#333'
      },
      minzoom: 14
    })

    this.map.addLayer(
      {
        layout: {
          visibility: 'none'
        },
        type: 'circle',
        source: 'devices',
        id: 'device-point-hover',
        paint: {
          'circle-color': [
            'case',
            ['==', ['get', 'state'], 'available'],
            '#4fd71d',
            ['==', ['get', 'state'], 'inactive'],
            'red',
            ['==', ['get', 'state'], 'reserved'],
            '#efef2a',
            ['==', ['get', 'state'], 'trip'],
            '#efef2a',
            ['rgba', 0, 0, 0, 1]
          ],
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 10, 1, 13, 6, 15, 8, 20, 10],
          'circle-opacity': 1,
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'state'], 'available'],
            '#4fd71d',
            ['==', ['get', 'state'], 'inactive'],
            'red',
            ['==', ['get', 'state'], 'reserved'],
            'yellow',
            ['==', ['get', 'state'], 'trip'],
            'yellow',
            ['rgba', 0, 0, 0, 1]
          ],
          'circle-stroke-opacity': 0.45,
          'circle-stroke-width': 5
        }
      },
      'devices'
    )

    this.map.addLayer(
      {
        layout: {
          visibility: 'none'
        },
        type: 'circle',
        source: 'devices',
        id: 'device-point-select',
        paint: {
          'circle-color': [
            'case',
            ['==', ['get', 'state'], 'available'],
            '#4fd71d',
            ['==', ['get', 'state'], 'inactive'],
            'red',
            ['==', ['get', 'state'], 'reserved'],
            '#efef2a',
            ['==', ['get', 'state'], 'trip'],
            '#efef2a',
            ['rgba', 0, 0, 0, 1]
          ],
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 10, 1, 13, 6, 15, 8, 20, 10],
          'circle-opacity': 1,
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'state'], 'available'],
            '#4fd71d',
            ['==', ['get', 'state'], 'inactive'],
            'red',
            ['==', ['get', 'state'], 'reserved'],
            'yellow',
            ['==', ['get', 'state'], 'trip'],
            'yellow',
            ['rgba', 0, 0, 0, 1]
          ],
          'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 12, 5, 15, 7],
          'circle-stroke-opacity': 0.45
        }
      },
      'devices'
    )

    this.map.on('moveend', this.onMove)
    this.map.on('mousemove', this.onMouseMove)
    this.map.on('click', this.onDeviceClick)

    this.setState({ mapLoaded: true })
  }

  onMove = () => {
    this.bbox = this.map.getBounds()
  }

  onMouseMove = e => {
    // Get first feature
    const features = this.map.queryRenderedFeatures(e.point, {
      layers: ['devices']
    })
    const feature = features && features[0] ? features[0] : null
    // console.log(feature);
    // Handle hover
    if (feature) {
      const sameDevice = feature && this.state.hovDevice === feature.properties.device_id
      if (sameDevice) {
        return // Do nothing
      }
      this.map.getCanvas().style.cursor = 'pointer' // Set pointer
      this.setState({ hovDevice: feature.properties.device_id }) // Set hover
      if (this.props.onHover) this.props.onHover(feature.properties)
      return
    }
    if (this.state.hovDevice) {
      // Clear hover
      this.setState({ hovDevice: null })
      if (this.props.onHover) this.props.onHover(null)
    }
    this.map.getCanvas().style.cursor = '' // Clear pointer
  }

  onDeviceClick = e => {
    // Get first feature
    const features = this.map.queryRenderedFeatures(e.point, {
      layers: ['devices']
    })
    const feature = features && features[0] ? features[0] : null

    // Handle select
    if (feature) {
      const sameDevice = feature && this.state.selDevice === feature.properties.device_id
      if (sameDevice) {
        // Do nothing
      } else {
        this.setState({ selDevice: feature.properties.device_id })
        if (this.props.onSelect) this.props.onSelect(feature.properties)
      }
    } else if (this.state.selDevice) {
      // Clear select
      this.setState({ selDevice: null })
      if (this.props.onSelect) this.props.onSelect(null)
    }
  }

  static style = {
    position: 'relative',
    overflow: 'hidden',
    height: 'calc(100vh - 56px)',
    width: '100%'
  }

  render() {
    return <div id={this.props.mapID} style={FindNearbyDeviceMap.style} />
  }
}

export default withAuth(FindNearbyDeviceMap)
