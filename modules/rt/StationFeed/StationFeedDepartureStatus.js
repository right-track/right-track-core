'use strict';

/**
 * Right Track StationFeedDepartureStatus Class
 * @see {@link StationFeedDepartureStatus}
 * @module rt/StationFeed/StationFeedDepartureStatus
 */

/**
 * Station Feed Departure Status
 * -----------------------------
 * Real-time Status Information about a departure from a Stop.
 *
 * **Module:** {@link module:rt/StationFeed/StationFeedDepartureStatus|rt/StationFeed/StationFeedDepartureStatus}
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
   * @param {string} track Departure Track
   * @param {string=} [remarks] Additional Remarks
   */
  constructor(status, delay, estDeparture, track, remarks) {

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
     * The departing Trip's track number
     * @type {string}
     */
    this.track = track;

    /**
     * Additional remarks for the departing Trip
     * @type {string}
     */
    this.remarks = remarks;

  }

}

module.exports = StationFeedDepartureStatus;