'use strict';

/**
 * Station Feed
 * ----------------
 * A real-time feed of status information of departures
 * from a single Stop.
 *
 * To access this Class directly:
 * ```javascript
 * const SF = require('right-track-core/modules/classes/RightTrackAgency/StationFeed');
 * const StationFeed = SF.StationFeed;
 * ```
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