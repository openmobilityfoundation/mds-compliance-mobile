/* eslint-disable import/prefer-default-export */
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
// Utility functions for doing math-y stuff
// ------------------------------------

// Return the percent of `value` between `min` and `max`, inclusive, as a number from `0...100`
// Returns `NaN` if `value` is not a number.
export function getPercent(value, min, max) {
  if (typeof value !== 'number') return NaN
  if (value < min) return 0
  if (value > max) return 1
  return ((value - min) / (max - min)) * 100
}
