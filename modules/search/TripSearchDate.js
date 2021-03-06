'use strict';

/**
 * Trip Search Date Class
 * @see {@link TripSearchDate}
 * @module search/TripSearchDate
 * @private
 */


/**
 * Trip Search Date
 * --------
 * This Class is used to provide the Trip Search date, time, and
 * effective services within the requested date/time range.
 * @class
 * @alias TripSearchDate
 * @private
 */
class TripSearchDate {

  /**
   * Create a new Trip Search Date
   * @param {int} date The Date in YYYYMMDD format
   * @param {int} preSeconds The search start time in seconds since midnight
   * @param {int} postSeconds The search end time in seconds since midnight
   * @param {Service[]} services Effective Services on this date
   */
  constructor(date, preSeconds, postSeconds, services) {

    /**
     * The Date in YYYYMMDD format
     * @type {int}
     */
    this.date = date;

    /**
     * The search start time in seconds since midnight
     * @type {int}
     */
    this.preSeconds = preSeconds;

    /**
     * The search end time in seconds since midnight
     * @type {int}
     */
    this.postSeconds = postSeconds;

    /**
     * List of effective Service IDs
     * @type {String[]}
     */
    this.serviceIds = [];
    for ( let i = 0; i < services.length; i++ ) {
      this.serviceIds.push(services[i].id);
    }

  }

}


module.exports = TripSearchDate;