'use strict';

/**
 * Right Track About Class
 * @see {@link About}
 * @module rt/About
 */

/**
 * RT About
 * --------
 * Representation of the data in the rt_about table, which holds the
 * information about the Right Track Database.
 *
 * Right Track Fields:
 * - Compile Date
 * - Publish Date
 * - Start Date
 * - End Date
 * - Version
 * - Version Notes
 *
 * **Module:** {@link module:rt/About|rt/About}
 *
 * @class
 * @alias About
 */
class About {

  /**
   * Right Track About Constructor
   * @constructor
   * @param {int} compile the compile date of the Right Track DB (yyyymmdd)
   * @param {int} publish the publish date of the Right Track DB (yyyymmdd)
   * @param {int} start the start date the Right Track DB schedule (yyyymmdd)
   * @param {int} end the end date of the Right Track DB schedule (yyyymmdd)
   * @param {int} version the version number of the Right Track DB (usually yyyymmddHH)
   * @param {string} notes the version notes of the Right Track DB
   */
  constructor(compile, publish, start, end, version, notes) {

    /**
     * The Right Track DB compile date in YYYYMMDD format
     * @type {Number}
     */
    this.compileDate = compile;

    /**
     * The GTFS publish date in YYYYMMDD format
     * @type {Number}
     */
    this.publishDate = publish;

    /**
     * The start date of the GTFS schedule data in YYYYMMDD format
     * @type {Number}
     */
    this.startDate = start;

    /**
     * The end date of the GTFS schedule data in YYYYMMDD format
     * @type {Number}
     */
    this.endDate = end;

    /**
     * The Right Track DB version
     * @type {Number}
     */
    this.version = version;

    /**
     * The Right Track DB version notes
     * @type {string}
     */
    this.notes = notes;

  }

}


module.exports = About;