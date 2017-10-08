'use strict';

/**
 * Right Track DB Query Functions
 * ------------------------------
 *
 * The following modules are used to query the Right Track Database:
 * - [About]{@link module:query/about}
 * - [Calendar]{@link module:query/calendar}
 * - [Holiday]{@link module:query/holiday}
 * - [Links]{@link module:query/links}
 * - [Routes]{@link module:query/routes}
 * - [Stops]{@link module:query/stops}
 * - [StopTimes]{@link module:query/stoptimes}
 * - [Trips]{@link module:query/trips}
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
