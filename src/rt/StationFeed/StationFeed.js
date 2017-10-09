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
   * @param {Stop} stop Station Feed Origin Stop
   * @param {DateTime} updated DateTime of when the data was last updated
   * @param {StationFeedDeparture[]} departures List of Station Feed Departures
   */
  constructor(stop, updated, departures) {
    this.stop = stop;
    this.updated = updated;
    this.departures = departures;
  }

}


module.exports = StationFeed;