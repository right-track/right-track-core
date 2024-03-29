'use strict';

/**
 * ### Right Track Core Library
 *
 * The `right-track-core` module is a bundle of modules representing GTFS and
 * Right Track data classes as well as methods for querying a Right Track
 * Database.
 *
 * @module /
 */

/**
 * @type {{gtfs, rt, query, search, utils, RightTrackTransitAgency}}
 */
module.exports = {

  /**
   * GTFS Classes
   * @see module:gtfs
   */
  gtfs: require('./gtfs'),

  /**
   * Right Track Classes
   * @see module:rt
   */
  rt: require('./rt'),

  /**
   * Right Track Database Query Functions
   * @see module:query
   */
  query: require('./query'),

  /**
   * Trip Search Classes and Functions
   * @see module:search
   */
  search: require('./search'),

  /**
   * Right Track Utility Functions
   * @see module:utils
   */
  utils: require('./utils'),

  /**
   * Right Track Abstract Classes
   * @see module:classes
   */
  classes: require('./classes')

};
