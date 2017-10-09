'use strict';

/**
 * Right Track Station Feed Classes
 * -------------------------------
 *
 * The following modules represent the different components of a Right Track
 * Station Feed:
 * - [StationFeed]{@link module:rt/StationFeed/StationFeed}
 * - [StationFeedDeparture]{@link module:rt/StationFeed/StationFeedDeparture}
 * - [StationFeedDepartureStatus]{@link module:rt/StationFeed/StationFeedDepartureStatus}
 *
 * @module rt/StationFeed
 */


module.exports = {
  StationFeed: require('./StationFeed.js'),
  StationFeedDeparture: require('./StationFeedDeparture.js'),
  StationFeedDepartureStatus: require('./StationFeedDepartureStatus.js')
};