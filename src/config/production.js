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

import { TELEMETRY_MODE } from 'constants.js'

export default {
  // DEBUG: Environment we're running in.  Overridden in `config/dev.js` and `config/staging.js`
  // See `CONFIG.md`
  _env: 'production',

  apps: {
    compliance: {
      api: {
        // (msec) Frequency to check for network access when offline.
        // See `EVENT_QUEUE.md`
        offlineCheckFrequency: 2000
      },
      app: {
        // App micro-build number, set via package.json build scripts.
        // Appears in `Build` item of app menu.
        build: process.env.REACT_APP_GIT_SHA,
        // App name, shown in window title.
        // NOTE: If you change this, change in `public/manifest.json` as well.
        name: 'MDS Compliance Mobile',
        // Top-level URL for the app, must be absoulte URL.
        // NOTE:  Match auth0 value for this app, see `AUTH0.md`
        url: 'https://ladot.mdscompliance.app/',
        // App version number, picked up from `package.json` during build.
        version: process.env.REACT_APP_VERSION
      },
      geolocation: {
        // Options to pass in to `navigator.geolocation.getCurrentPosition()`
        //  and `navigator.geolocation.watchPosition()`
        // See: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
        options: {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 5000
        },
        // Amount of time to cache result of `getCurrentPosition()` call.
        // See explanation in `src/device/geolocation.js::getLocation()`.
        cacheDuration: 1000
      },
      mapbox: {
        // Mapbox token, should be available from the mapbox account UI.
        // If you have different mapbox accounts for dev/staging,
        // override in `config/dev.js` and `config/staging.js`
        token: 'pk.eyJ1IjoibGFjdW5hLW1hcGJveCIsImEiOiJjanVibGY5MmowZXN6NGVtd3p4djR0dDd4In0.Fy7WHpGeYv9xQKNBMeBs5Q',

        // Mapbox settings for <FindNearbyDeviceMap>
        settings: {
          // Initial map center.
          center: [-118.243344, 34.052238],
          // Initial map zoom.
          initialZoom: 15,
          // Minimum (closest) zoom for map.  24 = inidiual streets clearly visible.
          maxZoom: 24,
          // Maximum (farthest) zoom -- set so you can see (most of) coverage area.
          minZoom: 11,
          // Mapbox visual style.  See: https://docs.mapbox.com/api/maps/#styles
          style: 'mapbox://styles/mapbox/light-v10'
        }
      },
      // Page-specific settings:
      pages: {
        audit: {
          // Mode for logging telemetry events while audit in progress:
          //  `TELEMETRY_MODE.location` = use browser geolocation.watchPosition()`
          //  `TELEMETRY_MODE.timer`    = log event periodically.
          tripTelemetryMode: TELEMETRY_MODE.location,
          // (msec) Time interval to post telemetry events while audit is in progress
          // when `tripTelemetryMode` is `timer`
          tripTelemetryTimerFrequency: 5000
        },
        map: {
          // (msec) Frequency to fetch vehicle status data on map page
          deviceFetchFrequency: 10000
        }
      },
      // Audit report thresholds:
      thresholds: {
        // trip_start and trip_end
        startEnd: {
          time_accuracy: 60, // (seconds)  audit.timestamp - provider.timestamp
          time_delay: 60, // (seconds) provider.timestamp - provider.recorded
          location_accuracy: 70 // (meters) audit.gps - provider.gps
        },
        // trip_enter and trip_leave
        enterLeave: {
          time_accuracy: 60, // (seconds)
          time_delay: 60, // (seconds)
          location_accuracy: 70 // (meters)
        },
        // all other events, including telemetry
        other: {
          time_accuracy: 60, // (seconds)
          time_delay: 60, // (seconds)
          location_accuracy: 70 // (meters)
        },
        // Telemetry event matching:
        telemetry: {
          matchTime: 10 // (seconds) match telemetry events w/in this time period
        },
        // audit trip vs provider trip totals totals
        totals: {
          distance_accuracy: 100, // (meters) total distance delta
          time_accuracy: 60 // (seconds) total time delta
        }
      }
    }
  },

  authentication: {
    // Settings for auth0 authentication.
    auth0: {
      // Domain server.
      domain: 'auth.ladot.io',
      // Client id for this application.
      // NOTE: You will likely override this in `config/dev.js` and `config/staging.js`
      clientId: 'GnOZN4A6qGgM3xHCTa8sgoDjwFq41m3T',
      // Path under `public` for logo to display during auth0 login.
      // Ideally an SVG with transparent background, a PNG will work as well.
      audience: 'https://api.ladot.io/',
      logoPath: 'agency/images/logo_vector.svg'
    }
  },

  provider: {
    // List of active MDS Providers for this agency, case insensitive.
    // NOTE: this is the order in which they will appear in app menus.
    // See: `mds-core/packages/mds-providers`
    activeProviders: ['Bird', 'Jump', 'Lime', 'Lyft', 'Sherpa', 'Spin', 'Wheels']
  },

  // URLs for MDS server endpoints used in this application
  serverEndpoints: {
    audit: 'https://api.ladot.io/audit'
  }
}
