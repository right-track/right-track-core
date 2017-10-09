'use strict';

/**
 * Right Track DB Query Functions
 * ------------------------------
 *
 * The following modules are used to query the Right Track Database:
 * - [about]{@link module:query/about}
 * - [calendar]{@link module:query/calendar}
 * - [holiday]{@link module:query/holiday}
 * - [links]{@link module:query/links}
 * - [routes]{@link module:query/routes}
 * - [stops]{@link module:query/stops}
 * - [stopTimes]{@link module:query/stoptimes}
 * - [trips]{@link module:query/trips}
 *
 * @module query
 */

module.exports = {
  about: require('./AboutTable.js'),
  calendar: require('./CalendarTable.js'),
  holiday: require('./HolidayTable.js'),
  links: require('./LinksTable.js'),
  routes: require('./RoutesTable.js'),
  stops: require('./StopsTable.js'),
  stoptimes: require('./StopTimesTable.js'),
  trips: require('./TripsTable.js')
};
