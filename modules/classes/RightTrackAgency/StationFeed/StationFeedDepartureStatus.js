'use strict';

/**
 * Station Feed Departure Status
 * -----------------------------
 * Real-time Status Information about a departure from a Stop.  Used by
 * the `StationFeedDeparture` Class.
 *
 * To access this Class directly:
 * ```javascript
 * const core = require('right-track-core');
 * const SF = core.classes.StationFeed;
 * const StationFeedDepartureStatus = SF.StationFeedDepartureStatus;
 * ```
 *
 * @class
 * @alias StationFeedDepartureStatus
 */
class StationFeedDepartureStatus {

  /**
   * Station Feed Departure Status Constructor
   * @constructor
   * @param {string} status Status label
   * @param {int} delay Delay of departure (minutes)
   * @param {DateTime} estDeparture DateTime of estimated departure
   * @param {string|StationFeedDepartureStatus~Track} track Departure Track (or departure track properties: track, scheduled, changed)
   * @param {string=} [remarks] Additional Remarks
   */
  constructor(status, delay, estDeparture, track, remarks) {

    // Convert track string to track object
    if ( track && typeof track === 'string' ) {
      track = {
        track: track,
        scheduled: false,
        changed: false
      }
    }
    else {
      track = {
        track: track.track ? track.track : "",
        scheduled: track.scheduled ? track.scheduled : false,
        changed: track.changed ? track.changed : false
      }
    }

    /**
     * The departing Trip's Status
     * @type {string}
     */
    this.status = status;

    /**
     * The departing Trip's Delay (in minutes)
     * @type {Number}
     */
    this.delay = delay;

    /**
     * The Date/Time of the estimated departure of the Trip
     * @type {DateTime}
     */
    this.estDeparture = estDeparture;

    /**
     * The departing Trip's track properties
     * @type {StationFeedDepartureStatus~Track}
     */
    this.track = track;

    /**
     * Additional remarks for the departing Trip
     * @type {string}
     */
    this.remarks = remarks;

  }

}

/**
 * @typedef {Object} StationFeedDepartureStatus~Track Departure track properties
 * @property {string} track The departure track
 * @property {boolean} [scheduled] Flag for a scheduled track (not yet decided)
 * @property {changed} [changed] Flag for a changed track
 */

module.exports = StationFeedDepartureStatus;