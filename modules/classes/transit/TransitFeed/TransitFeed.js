'use strict';

/**
 * Transit Feed
 * ------------
 * A real-time status information feed provided by a third-party Transit Agency.
 *
 * The Transit Feed contains a list of Transit Divisions
 * A Transit Division contains either a list of child Divisions or Events
 * A Transit Event contains the status and details of an event.
 *
 * @class
 * @alias TransitFeed
 */
class TransitFeed {

  /**
   * Create a new Transit Feed
   * @param {Date} [updated] The Date/Time when the feed was last updated
   */
  constructor(updated) {

    /**
     * The Date/Time when the feed was last updated
     * @type {Date}
     */
    this.updated = updated !== undefined ? updated : new Date();

    /**
     * List of Transit Divisions for this Feed
     * @type {TransitDivision[]}
     */
    this.divisions = [];

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


module.exports = TransitFeed;
