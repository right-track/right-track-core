'use strict';

/**
 * ### Right Track Abstract Classes
 * These modules provide the abstract Right Track Classes used by modules 
 * implementing these data types
 * @module classes
 */

 module.exports = {

  /**
   * Right Track DB Abstract Class
   * @see RightTrackDB
   */
  RightTrackDB: require('./RightTrackDB'),

  /**
   * Right Track Agency Abstract Class
   * @see RightTrackAgency
   */
  RightTrackAgency: require('./RightTrackAgency'),

  /**
   * Right Track Agency Station Feed Classes
   * @see StationFeed
   * @see StationFeedDeparture
   * @see StationFeedDepartureStatus
   */
  StationFeed: require('./RightTrackAgency/StationFeed'),

  /**
   * Right Track Transit Agency Abstract Class
   * @see RightTrackTransitAgency
   */
  RightTrackTransitAgency: require('./RightTrackTransitAgency')

 }