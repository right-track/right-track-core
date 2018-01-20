'use strict';

/**
 * Trip Search Class
 * @see {@link TripSearch}
 * @module search/TripSearch
 */


const DateTime = require('../utils/DateTime.js');
const search = require('./search.js');


/**
 * Trip Search
 * --------
 * This Class sets the parameters and options of a Trip Search: a search
 * of the GTFS schedule data finding trips (direct and/or with transfers)
 * from the origin Stop to the destination Stop at the specified time
 * with the specified options.
 *
 * **Module:** {@link module:search/TripSearch|search/TripSearch}
 *
 * @class
 * @alias TripSearch
 */
class TripSearch {

  /**
   * Set the parameters of a new Trip Search
   * @param {Stop} origin Origin Stop
   * @param {Stop} destination Destination Stop
   * @param {DateTime} [departure=now] The Departure Date/Time of the Trip Search
   * @param {Object} [options] Trip Search Options
   * @param {boolean} [options.allowTransfers=true] Allow transfers between trains
   * @param {boolean} [options.allowChangeInDirection=true] Allow transfers that change direction of travel
   * @param {int} [options.preDepartureHours=3] The number of hours before the requested departure to include in results
   * @param {int} [options.postDepartureHours=6] The number of hours after the requested departure to include in results
   * @param {int} [options.maxLayoverMins=30] The maximum number of minutes to layover at a transfer Stop
   * @param {int} [options.minLayoverMins=0] The minimum number of minutes to layover at a transfer Stop
   * @param {int} [options.maxTransfers=2] The maximum number of transfers
   */
  constructor(origin, destination, departure, options) {

    // Datetime and Options not provided
    if ( departure === undefined && options === undefined ) {
      departure = DateTime.now();
      options = {};
    }

    // Options Not Provided
    else if ( options === undefined && departure instanceof DateTime ) {
      options = {};
    }

    // DateTime Not Provided
    else if ( options === undefined && !(departure instanceof DateTime) ) {
      options = departure;
      departure = DateTime.now();
    }

    /**
     * Trip Search Origin Stop
     * @type {Stop}
     */
    this.origin = origin;

    /**
     * Trip Search Destination Stop
     * @type {Stop}
     */
    this.destination = destination;

    /**
     * Trip Search Departure Date/Time
     * @type {DateTime}
     * @default now
     */
    this.departure = departure !== undefined ? departure
      : DateTime.now();

    /**
     * Allow Transfers between Trains
     * @type {boolean}
     * @default true
     */
    this.allowTransfers =  options.hasOwnProperty('allowTransfers') ? options.allowTransfers
      : true;

    /**
     * Allow Transfers between trains operating in opposite directions
     * @type {boolean}
     * @default true
     */
    this.allowChangeInDirection =  options.hasOwnProperty('allowChangeInDirection') ? options.allowChangeInDirection
      : true;

    /**
     * The number of hours before the departure time to include in results
     * @type {int}
     * @default 3
     */
    this.preDepartureHours = options.hasOwnProperty('preDepartureHours') ? options.preDepartureHours
      : 3;

    /**
     * The number of hours after the departure time to include in results
     * @type {int}
     * @default 6
     */
    this.postDepartureHours = options.hasOwnProperty('postDepartureHours') ? options.postDepartureHours
      : 6;

    /**
     * The maximum number of minutes between trips at a layover
     * @type {int}
     * @default 30
     */
    this.maxLayoverMins = options.hasOwnProperty('maxLayoverMins') ? options.maxLayoverMins
      : 30;

    /**
     * The minimum number of minutes between trips at a layover
     * @type {int}
     * @default 0
     */
    this.minLayoverMins = options.hasOwnProperty('minLayoverMins') ? options.minLayoverMins
      : 0;

    /**
     * The maximum number of transfers for a single result
     * @type {int}
     * @default 2
     */
    this.maxTransfers = options.hasOwnProperty('maxTransfers') ? options.maxTransfers
      : 2;

  }

  /**
   * All of the Trip Search options
   * @returns {{allowTransfers: boolean, allowChangeInDirection: boolean, preDepartureHours: int, postDepartureHours: int, maxLayoverMins: int, minLayoverMins: int, maxLayovers: int}}
   */
  get options() {
    return {
      allowTransfers: this.allowTransfers,
      allowChangeInDirection: this.allowChangeInDirection,
      preDepartureHours: this.preDepartureHours,
      postDepartureHours: this.postDepartureHours,
      maxLayoverMins: this.maxLayoverMins,
      minLayoverMins: this.minLayoverMins,
      maxTransfers: this.maxTransfers
    }
  }


  /**
   * Perform the trip search on the provided Right Track Database
   * @param {RightTrackDB} db The Right Track DB to query
   * @param {function} callback Callback function
   * @param {Error} callback.err Database Query Error
   * @param {TripSearchResult[]} [callback.results] Trip Search Results
   */
  search(db, callback) {
    search(db, this.origin, this.destination, this.departure, this.options, callback);
  }

}


module.exports = TripSearch;