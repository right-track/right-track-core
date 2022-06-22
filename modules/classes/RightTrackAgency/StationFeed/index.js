'use strict';


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
  StationFeedDepartureStatus: require('./StationFeedDepartureStatus.js'),

  /**
   * StationFeedDeparturePosition Class (used by a StationFeedDeparture)
   * @see StationFeedDeparturePosition
   */
  StationFeedDeparturePosition: require('./StationFeedDeparturePosition.js')

};