'use strict';

/**
 * Station Feed Departure Position
 * -----------------------------
 * Real-time Position Information about a departure from a Stop.  Used by
 * the `StationFeedDeparture` Class.
 *
 * To access this Class directly:
 * ```javascript
 * const core = require('right-track-core');
 * const SF = core.classes.StationFeed;
 * const StationFeedDeparturePosition = SF.StationFeedDeparturePosition;
 * ```
 *
 * @class
 * @alias StationFeedDeparturePosition
 */
class StationFeedDeparturePosition {

  /**
   * Station Feed Departure Position Constructor
   * @constructor
   * @param {Number} lat Latitude of real-time position
   * @param {Number} lon Longitude of real-time position
   * @param {String} [description] Description of real-time position (ie "In transit to {next stop}")
   * @param {DateTime} updated DateTime of when the real-time position was last updated
   */
  constructor(lat, lon, description, updated) {

    // Parse params
    if ( !updated ) {
      updated = description;
      description = undefined;
    }

    /**
     * The real-time position latitude
     * @type {Number}
     */
    this.lat = lat;

    /**
     * The real-time position longitude
     * @type {Number}
     */
    this.lon = lon;

    /**
     * The real-time position description
     * @type {String}
     */
    this.description = description;

    /**
     * The date/time of when the real-time 
     * position was last updated
     * @type {DateTime}
     */
    this.updated = updated;

  }

}


module.exports = StationFeedDeparturePosition;