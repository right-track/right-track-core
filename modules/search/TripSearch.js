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
   * @param {DateTime} [datetime=now] The Date/Time of the Trip Search
   * @param {Object} [options] Trip Search Options
   * @param {boolean} [options.allowTransfers=true] Allow transfers between trains
   * @param {boolean} [options.allowChangeInDirection=true] Allow transfers that change direction of travel
   * @param {int} [options.preDateHours=3] The number of hours before `datetime` to include in results
   * @param {int} [options.postDateHours=6] The number of hours after `datetime` to include in results
   * @param {int} [options.maxLayoverMins=30] The maximum number of minutes to layover at a transfer Stop
   * @param {int} [options.minLayoverMins=0] The minimum number of minutes to layover at a transfer Stop
   * @param {int} [options.maxTransfers=2] The maximum number of transfers
   */
  constructor(origin, destination, datetime, options) {

    // Datetime and Options not provided
    if ( datetime === undefined && options === undefined ) {
      datetime = DateTime.now();
      options = {};
    }

    // Options Not Provided
    else if ( options === undefined && datetime instanceof DateTime ) {
      options = {};
    }

    // DateTime Not Provided
    else if ( options === undefined && !(datetime instanceof DateTime) ) {
      options = datetime;
      datetime = DateTime.now();
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
    this.datetime = datetime !== undefined ? datetime
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
    this.preDateHours = options.hasOwnProperty('preDateHours') ? options.preDateHours
      : 3;

    /**
     * The number of hours after the departure time to include in results
     * @type {int}
     * @default 6
     */
    this.postDateHours = options.hasOwnProperty('postDateHours') ? options.postDateHours
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
     * The maximum number of layovers for a single result
     * @type {int}
     * @default 2
     */
    this.maxLayovers = options.hasOwnProperty('maxLayovers') ? options.maxLayovers
      : 2;

  }

  /**
   * All of the Trip Search options
   * @returns {{allowTransfers: boolean, allowChangeInDirection: boolean, preDateHours: int, postDateHours: int, maxLayoverMins: int, minLayoverMins: int, maxLayovers: int}}
   */
  get options() {
    return {
      allowTransfers: this.allowTransfers,
      allowChangeInDirection: this.allowChangeInDirection,
      preDateHours: this.preDateHours,
      postDateHours: this.postDateHours,
      maxLayoverMins: this.maxLayoverMins,
      minLayoverMins: this.minLayoverMins,
      maxLayovers: this.maxLayovers
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
    search(db, this.origin, this.destination, this.datetime, this.options, callback);
  }

}


module.exports = TripSearch;