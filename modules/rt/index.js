'use strict';

/**
 * ### Right Track Data Classes
 * These classes are used to represent the custom Right Track data
 * @module rt
 */

module.exports = {

  /**
   * Right Track About Class
   * @see About
   */
  About: require('./About.js'),

  /**
   * Right Track Favorite Class
   * @see Favorite
   */
  Favorite: require('./Favorite.js'),

  /**
   * Right Track Holiday Class
   * @see Holiday
   */
  Holiday: require('./Holiday.js'),

  /**
   * Right Track Link Class
   * @see Link
   */
  Link: require('./Link.js'),

  /**
   * Right Track Station Feed Classes
   * @see module:rt/StationFeed
   */
  StationFeed: require('./StationFeed/')
};
