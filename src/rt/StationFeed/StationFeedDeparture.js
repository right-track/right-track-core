'use strict';

/**
 * Right Track StationFeedDeparture Class
 * @see {@link StationFeedDeparture}
 * @module rt/StationFeed/StationFeedDeparture
 */


/**
 * Station Feed Departure
 * ----------------------
 * Real-time and departure information about the departure of
 * a single Trip from a Stop.  Used by the StationFeed Class.
 *
 * **Module:** {@link module:rt/StationFeed/StationFeedDeparture|rt/StationFeed/StationFeedDeparture}
 *
 * @class
 * @alias StationFeedDeparture
 */
StationFeedDeparture = class StationFeedDeparture {

  /**
   * Station Feed Departure Constructor
   * @constructor
   * @param {DateTime} departure DateTime of scheduled departure
   * @param {Stop} destination Destination Stop
   * @param {Trip} trip Departure Trip
   * @param {StationFeedDepartureStatus} status Real-time Status Information
   */
  constructor(departure, destination, trip, status) {
    this.departure = departure;
    this.destination = destination;
    this.trip = trip;
    this.status = status;
  }

};


/**
 * Sort Departures by scheduled departure date/time
 * @param {StationFeedDeparture} a Departure A
 * @param {StationFeedDeparture} b Departure B
 * @returns {int} compare integer
 */
StationFeedDeparture.sort = function(a, b) {
  if ( a.departure < b.departure ) {
    return -1;
  }
  else if ( a.departure > b.departure ) {
    return 1;
  }
  else {
    return 0;
  }
};


module.exports = StationFeedDeparture;