'use strict';

/**
 * Station Feed Departure
 * ----------------------
 * Real-time and departure information about the departure of
 * a single Trip from a Stop.  Used by the `StationFeed` Class.
 *
 * To access this Class directly:
 * ```javascript
 * const core = require('right-track-core');
 * const SF = core.classes.StationFeed;
 * const StationFeedDeparture = SF.StationFeedDeparture;
 * ```
 *
 * @class
 * @alias StationFeedDeparture
 */
class StationFeedDeparture {

  /**
   * Station Feed Departure Constructor
   * @constructor
   * @param {DateTime} departure DateTime of scheduled departure
   * @param {Stop} destination Destination Stop
   * @param {Trip} trip Departure Trip
   * @param {StationFeedDepartureStatus} status Real-time Status Information
   */
  constructor(departure, destination, trip, status) {

    /**
     * The Date/Time of the Scheduled Departure
     * @type {DateTime}
     */
    this.departure = departure;

    /**
     * The (final) Destination Stop of the departing Trip
     * @type {Stop}
     */
    this.destination = destination;

    /**
     * The Trip departing the Station
     * @type {Trip}
     */
    this.trip = trip;

    /**
     * The Station Feed Status of the Departure
     * @type {StationFeedDepartureStatus}
     */
    this.status = status;

  }

}


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
    if ( a.destination.name < b.destination.name ) {
      return -1;
    }
    else if ( a.destination.name > b.destination.name ) {
      return 1;
    }
    else {
      return 0;
    }
  }
};


module.exports = StationFeedDeparture;