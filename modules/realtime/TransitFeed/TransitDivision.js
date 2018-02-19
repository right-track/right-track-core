'use strict';

/**
 * Right Track Transit Division
 * @see {@link TransitDivision}
 * @module realtime/TransitFeed/TransitDivision
 */

/**
 * Transit Feed Division
 * ----------------
 * A single Division contained in a real-time Transit Feed.
 *
 * The Transit Division contains the list of Lines that belong to the Division
 *
 * **Module:** {@link module:realtime/TransitFeed/TransitDivision|realtime/TransitFeed/TransitDivision}
 *
 * @class
 * @alias TransitDivision
 */
class TransitDivision {

  /**
   * Create a new Transit Division
   * @param {string} code Division Code
   * @param {string} name Division Name
   * @param {string} [iconUrl] Division Icon URL
   */
  constructor(code, name, iconUrl) {

    /**
     * Transit Division Code
     * @type {string}
     */
    this.code = code;

    /**
     * Transit Division Display Name
     * @type {string}
     */
    this.name = name;

    /**
     * Transit Division Icon URL
     * @type {string}
     */
    this.iconUrl = iconUrl;

    /**
     * List of Transit Lines for this Division
     * @type {TransitLine[]}
     */
    this.lines = [];

  }

  /**
   * Add a Transit Line to this Division
   * @param {TransitLine} line Transit Line to add
   */
  addLine(line) {
    this.lines.push(line);
  }

  /**
   * Get the number of Transit Events for this Division
   * @returns {number}
   */
  getEventCount() {
    let count = 0;
    for ( let i = 0; i < this.lines.length; i++ ) {
      count += this.lines[i].getEventCount();
    }
    return count;
  }

}