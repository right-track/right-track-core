'use strict';

/**
 * Right Track StationFeed Class
 * @see {@link StationFeed}
 * @module rt/StationFeed/StationFeed
 */

/**
 * Station Feed
 * ----------------
 * A real-time feed of status information of departures
 * from a single Stop.
 *
 * **Module:** {@link module:rt/StationFeed/StationFeed|rt/StationFeed/StationFeed}
 *
 * @class
 * @alias StationFeed
 */
class StationFeed {

  /**
   * Station Feed Constructor
   * @constructor
   * @param {Stop} stop Origin Stop
   * @param {DateTime} updated Last Updated
   * @param {StationFeedDeparture[]} departures List of Departures
   */
  constructor(stop, updated, departures) {

    /**
     * The Origin Stop of the Station Feed
     * @type {Stop}
     */
    this.stop = stop;

    /**
     * The Date/Time of when the data was last updated
     * @type {DateTime}
     */
    this.updated = updated;

    /**
     * List of Station Feed Departures for this Station Feed
     * @type {StationFeedDeparture[]}
     */
    this.departures = departures;

  }

}


module.exports = StationFeed;