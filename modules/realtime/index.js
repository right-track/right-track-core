'use strict';

/**
 * ### Right Track Real-Time Data Classes
 * These classes are used to represent the Right Track Real-Time
 * status information
 * @module realtime
 */

module.exports = {

  /**
   * Right Track Station Feed Classes
   * @see module:realtime/StationFeed
   */
  StationFeed: require('./StationFeed/'),

  /**
   * Right Track Transit Feed Classes
   * @see module:realtime/TransitFeed
   */
  TransitFeed: require('./TransitFeed/')

};
