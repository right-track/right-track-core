'use strict';

/**
 * ### Right Track DB Query Functions
 * These modules are used to query the various tables in a Right Track Database
 * @module query
 */


/**
 * Clear the query caches for each of the query modules
 * @private
 */
function clearCache() {
  require('./AboutTable.js').clearCache();
  require('./CalendarTable.js').clearCache();
  require('./DirectionsTable.js').clearCache();
  require('./HolidayTable.js').clearCache();
  require('./LineGraphTable.js').clearCache();
  require('./LinksTable.js').clearCache();
  require('./RouteGraphTable.js').clearCache();
  require('./RoutesTable.js').clearCache();
  require('./StopsTable.js').clearCache();
  require('./StopTimesTable.js').clearCache();
  require('./TripsTable.js').clearCache();
  require('./ShapesTable.js').clearCache();
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
   * Query gtfs_directions table
   * @see module:query/direction
   */
  directions: require('./DirectionsTable.js'),

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
   * Quuery gtfs_shapes table
   */
  shapes: require('./ShapesTable.js'),

  /**
   * Query rt_route_graph table
   * @see module:query/routegraph
   */
  routegraph: require('./RouteGraphTable.js'),

  /**
   * Query rt_line_graph table
   * @see module:query/linegraph
   */
  linegraph: require('./LineGraphTable.js'),

  /**
   * Clear the query caches for each of the query modules
   * @function
   */
  clearCache: clearCache

};
