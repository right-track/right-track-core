'use strict';

/**
 * ### GTFS Data Classes
 * These classes are used to represent GTFS data
 * @module gtfs
 */

module.exports = {

  /**
   * GTFS Agency Class
   * @see Agency
   */
  Agency: require('./Agency.js'),

  /**
   * GTFS Route Class
   * @see Route
   */
  Route: require('./Route.js'),

  /**
   * GTFS Service Class
   * @see Service
   */
  Service: require('./Service.js'),

  /**
   * GTFS ServiceException Class
   * @see ServiceException
   */
  ServiceException: require('./ServiceException.js'),

  /**
   * GTFS Stop Class
   * @see Stop
   */
  Stop: require('./Stop.js'),

  /**
   * GTFS StopTime Class
   * @see StopTime
   */
  StopTime: require('./StopTime.js'),

  /**
   * GTFS Trip Class
   * @see Trip
   */
  Trip: require('./Trip.js'),

  /**
   * GTFS Shape Class
   * @see Shape
   */
  Shape: require('./Shape.js')

};
