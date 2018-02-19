'use strict';

/**
 * Right Track TransitFeed Class
 * @see {@link TransitFeed}
 * @module realtime/TransitFeed/TransitFeed
 */

/**
 * Transit Feed
 * ------------
 * A real-time status information feed provided by a third-party Transit Agency.
 *
 * The Transit Feed contains a list of Transit Divisions
 * A Transit Division contains a list of Transit Lines
 * A Transit Line contains a list of Transit Events
 * A Transit Event contains the status and details of an event.
 *
 * **Module:** {@link module:realtime/TransitFeed/TransitFeed|realtime/TransitFeed/TransitFeed}
 *
 * @class
 * @alias TransitFeed
 */
class TransitFeed {

  /**
   * Create a new Transit Feed
   */
  constructor() {

    /**
     * List of Transit Divisions for this Feed
     * @type {TransitDivision[]}
     */
    this.divisions = [];

  }

  /**
   * Add a Transit Division to this Feed
   * @param {TransitDivision} division Transit Division to add
   */
  addDivision(division) {
    this.divisions.push(division);
  }

  /**
   * Get the number of Transit Events for this Feed
   * @returns {number}
   */
  getEventCount() {
    let count = 0;
    for ( let i = 0; i < this.divisions.length; i++ ) {
      count += this.divisions[i].getEventCount();
    }
    return count;
  }

}