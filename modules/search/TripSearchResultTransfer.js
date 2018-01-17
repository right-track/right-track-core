'use strict';

/**
 * Trip Search Result Transfer Class
 * @see {@link TripSearchResultTransfer}
 * @module search/TripSearchResultTransfer
 */



/**
 * Trip Search Result Transfer
 * --------
 * This Class represents a Transfer between two {@link TripSearchResultSegment|Trip Search Result Segments}
 * in a {@link TripSearchResult|Trip Search Result}.  The Transfer Class contains
 * information on the Transfer Stop, the arrival and departure times to/from the
 * Transfer Stop and the layover time spent at the Transfer Stop.
 *
 * **Module:** {@link module:search/TripSearchResultTransfer|search/TripSearchResultTransfer}
 *
 * @class
 * @alias TripSearchResultTransfer
 */
class TripSearchResultTransfer {

  /**
   * Create a new Trip Search Result Transfer at the specified
   * Transfer Stop with the provided arrival and departure times.
   * @param {Stop} stop Transfer Stop
   * @param {DateTime} arrival Arrival Date/Time
   * @param {DateTime} departure Departure Date/Time
   */
  constructor(stop, arrival, departure) {

    /**
     * The Transfer Stop
     * @type {Stop}
     */
    this.stop = stop;

    /**
     * The Arrival Date/Time to the Transfer Stop
     * @type {DateTime}
     */
    this.arrival = arrival;

    /**
     * The Departure Date/Time from the Transfer Stop
     * @type {DateTime}
     */
    this.departure = departure;

    /**
     * The Layover Time (minutes) spent at the Transfer Stop
     * @type {number}
     */
    this.layoverTime = (this.departure.toTimestamp() - this.arrival.toTimestamp())/60000;

  }

}


module.exports = TripSearchResultTransfer;