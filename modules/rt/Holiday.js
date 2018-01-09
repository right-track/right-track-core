'use strict';

/**
 * Right Track Holiday Class
 * @see {@link Holiday}
 * @module rt/Holiday
 */

/**
 * RT Holiday
 * --------
 * Representation of the data in the rt_holidays table, which holds
 * information about observed holidays and their service information.
 *
 * Right Track Fields:
 * - Date
 * - Name
 * - Peak
 * - Service Information
 *
 * **Module:** {@link module:rt/Holiday|rt/Holiday}
 *
 * @class
 * @alias Holiday
 */
class Holiday {

  /**
   * Right Track Holiday Constructor
   * @constructor
   * @param {int} date Holiday Date (yyyymmdd)
   * @param {string} name Holiday Name
   * @param {boolean} peak Holiday Peak Status (true if there are still peak trains)
   * @param {string} serviceInformation Holiday Service Information
   */
  constructor(date, name, peak, serviceInformation) {

    /**
     * The date of the Holiday in YYYYMMDD format
     * @type {Number}
     */
    this.date = date;

    /**
     * The name of the Holiday
     * @type {string}
     */
    this.name = name;

    /**
     * Value indicating if Peak service is effective on the Holiday
     * @type {boolean}
     */
    this.peak = peak;

    /**
     * Descriptive information for the Holiday's service
     * @type {string}
     */
    this.serviceInformation = serviceInformation;

  }

}


module.exports = Holiday;