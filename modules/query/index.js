'use strict';

/**
 * ### Right Track DB Query Functions
 * These modules are used to query the various tables in a Right Track Database
 * @module query
 */


/**
 * Clear the query caches for each of the query modules
 */
function clearCache() {
  require('./AboutTable.js').clearCache();
  require('./CalendarTable.js').clearCache();
  require('./HolidayTable.js').clearCache();
  require('./LinksTable.js').clearCache();
  require('./RoutesTable.js').clearCache();
  require('./StopsTable.js').clearCache();
  require('./StopTimesTable.js').clearCache();
  require('./TripsTable.js').clearCache();
}


module.exports = {

  /**
   * Query rt_about table
   * @see module:query/about
   */
  about: require('./AboutTable.js'),

  /**
   * Query gtfs_calendar and gtfs_calendar_dates tables
   * @see module:query/calendar
   */
  calendar: require('./CalendarTable.js'),

  /**
   * Query rt_holidays table
   * @see module:query/holiday
   */
  holiday: require('./HolidayTable.js'),

  /**
   * Query rt_links table
   * @see module:query/links
   */
  links: require('./LinksTable.js'),

  /**
   * Query gtfs_routes table
   * @see module:query/routes
   */
  routes: require('./RoutesTable.js'),

  /**
   * Query gtfs_stops table
   * @see module:query/stops
   */
  stops: require('./StopsTable.js'),

  /**
   * Query gtfs_stop_times table
   * @see module:query/stoptimes
   */
  stoptimes: require('./StopTimesTable.js'),

  /**
   * Query gtfs_trips table
   * @see module:query/trips
   */
  trips: require('./TripsTable.js'),

  /**
   * Clear the query caches
   */
  clearCache: clearCache
};
