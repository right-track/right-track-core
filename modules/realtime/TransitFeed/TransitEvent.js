'use strict';

/**
 * Right Track Transit Event
 * @see {@link TransitEvent}
 * @module realtime/TransitFeed/TransitEvent
 */

/**
 * Transit Feed Event
 * ----------------
 * A single Event contained in a real-time Transit Line.
 *
 * The Transit Event contains the specific event status and details.
 *
 * **Module:** {@link module:realtime/TransitFeed/TransitEvent|realtime/TransitFeed/TransitEvent}
 *
 * @class
 * @alias TransitEvent
 */
class TransitEvent {

  /**
   * Create a new Transit Event
   * @param {string} status Event Status
   * @param {string} details Event Details
   */
  constructor(status, details) {

    /**
     * Transit Event Status
     * @type {string}
     */
    this.status = status;

    /**
     * Transit Event Details
     * @type {string}
     */
    this.details = details;

  }

}