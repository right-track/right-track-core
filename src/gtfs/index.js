'use strict';

/**
 * GTFS Data Classes
 * -----------------
 *
 * The GTFS modules include the following data Classes:
 * - [Agency]{@link module:gtfs/Agency}
 * - [Route]{@link module:gtfs/Route}
 * - [Service]{@link module:gtfs/Service}
 * - [ServiceException]{@link module:gtfs/ServiceException}
 * - [Stop]{@link module:gtfs/Stop}
 * - [StopTime]{@link module:gtfs/StopTime}
 * - [Trip]{@link module:gtfs/Trip}
 *
 * @module gtfs
 */

module.exports = {
  Agency: require('./Agency.js'),
  Route: require('./Route.js'),
  Service: require('./Service.js'),
  ServiceException: require('./ServiceException.js'),
  Stop: require('./Stop.js'),
  StopTime: require('./StopTime.js'),
  Trip: require('./Trip.js')
};
