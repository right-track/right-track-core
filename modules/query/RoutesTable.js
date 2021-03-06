'use strict';

/**
 * ### Route Query Functions
 * These functions query the `gtfs_routes` table in the Right Track Database.
 * @module query/routes
 */

const cache = require('memory-cache');
const Agency = require('../gtfs/Agency.js');
const Route = require('../gtfs/Route.js');



// ==== QUERY FUNCTIONS ==== //


/**
 * Get the Route (with its Agency) specified by the Route ID
 * from the passed database
 *
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {string|string[]} id Route ID(s)
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Route|Route[]} [callback.route] The selected Route(s)
 */
function getRoute(db, id, callback) {

  // Build route id string
  let routeIds = "";
  if ( typeof id === 'string' || typeof id === 'number' ) {
    routeIds = "('" + id + "')";
  }
  else {
    try {
      routeIds = "('" + id.join("', '") + "')";
    }
    catch(err) {
      console.warn(err);
      routeIds = "('" + id + "')";
    }
  }

  // Check the cache for Route
  let cacheKey = db.id + "-" + routeIds;
  let cache = cache_route.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Build the select statement
  let select = "SELECT " +
    "gtfs_routes.route_id, route_short_name, route_long_name, route_desc, route_type, route_url, route_color, route_text_color, " +
    "gtfs_agency.agency_id, agency_name, agency_url, agency_timezone, agency_lang, agency_phone, agency_fare_url " +
    "FROM gtfs_routes, gtfs_agency " +
    "WHERE gtfs_routes.agency_id=gtfs_agency.agency_id AND " +
    "gtfs_routes.route_id IN " + routeIds + ";";

  // Query the database
  db.select(select, function(err, results) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // List of routes to return
    let rtn = [];

    // Parse each returned route...
    for ( let i = 0; i < results.length; i++ ) {
      let result = results[i];

      // Create Agency
      let agency = new Agency(
        result.agency_name,
        result.agency_url,
        result.agency_timezone,
        {
          id: result.agency_id,
          lang: result.agency_lang,
          phone: result.agency_phone,
          fare_url: result.agency_fare_url
        }
      );

      // Create Route
      let route = new Route(
        result.route_id,
        result.route_short_name,
        result.route_long_name,
        result.route_type,
        {
          agency: agency,
          description: result.route_desc,
          url: result.route_url,
          color: result.route_color,
          textColor: result.route_text_color
        }
      );

      // Add route to list
      rtn.push(route);

    }

    // No Route(s) found, return undefined
    if ( rtn.length === 0 ) {
      return callback(null, undefined);
    }

    // Return Route(s)
    else if ( rtn.length === 1 ) {
      cache_route.put(cacheKey, rtn[0]);
      return callback(null, rtn[0]);
    }
    else {
      cache_route.put(cacheKey, rtn);
      return callback(null, rtn);
    }

  });

}


/**
 * Get all of the Routes that are stored in the passed database
 *
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Route[]} [callback.routes] The selected Routes
 */
function getRoutes(db, callback) {

  // Check cache for routes
  let cacheKey = db.id + "-" + 'routes';
  let cache = cache_routes.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Build the select statement
  let select = "SELECT " +
    "gtfs_routes.route_id, route_short_name, route_long_name, route_desc, route_type, route_url, route_color, route_text_color, " +
    "gtfs_agency.agency_id, agency_name, agency_url, agency_timezone, agency_lang, agency_phone, agency_fare_url " +
    "FROM gtfs_routes, gtfs_agency " +
    "WHERE gtfs_routes.agency_id=gtfs_agency.agency_id";

  // Query the database
  db.select(select, function(err, results) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // List of routes to return
    let rtn = [];

    // Parse each row of the results...
    for ( let i = 0; i < results.length; i++ ) {
      let row = results[i];

      // Create Agency
      let agency = new Agency(
        row.agency_name,
        row.agency_url,
        row.agency_timezone,
        {
          id: row.agency_id,
          lang: row.agency_lang,
          phone: row.agency_phone,
          fare_url: row.agency_fare_url
        }
      );

      // Create Route
      let route = new Route(
        row.route_id,
        row.route_short_name,
        row.route_long_name,
        row.route_type,
        {
          agency: agency,
          description: row.route_desc,
          url: row.route_url,
          color: row.route_color,
          textColor: row.route_text_color
        }
      );

      // Add the route to the return list
      rtn.push(route);
    }

    // Sort the Routes by Name
    rtn.sort(Route.sortByName);

    // Add the Routes to the cache
    cache_routes.put(cacheKey, rtn);

    // Return the Routes
    return callback(null, rtn);

  });

}


// ==== SETUP CACHES ==== //
let cache_route = new cache.Cache();
let cache_routes = new cache.Cache();

/**
 * Clear the RoutesTable caches
 * @private
 */
function clearCache() {
  cache_route.clear();
  cache_routes.clear();
}



// Export Functions
module.exports = {
  getRoute : getRoute,
  getRoutes: getRoutes,
  clearCache: clearCache
};