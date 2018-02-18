'use strict';

/**
 * ### Right Track Station Feed Classes
 * These classes are used to represent the different components of a Right
 * Track Station Feed
 * @module realtime/StationFeed
 */


module.exports = {

  /**
   * StationFeed Class
   * @see StationFeed
   */
  StationFeed: require('./StationFeed.js'),

  /**
   * StationFeedDeparture Class (used by a StationFeed)
   * @see StationFeedDeparture
   */
  StationFeedDeparture: require('./StationFeedDeparture.js'),

  /**
   * StationFeedDepartureStatus Class (used by a StationFeedDeparture)
   * @see StationFeedDepartureStatus
   */
  StationFeedDepartureStatus: require('./StationFeedDepartureStatus.js')

};