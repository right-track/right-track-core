'use strict';

const Agency = require('../gtfs/Agency.js');
const Route = require('../gtfs/Route.js');


// ==== CALLBACK FUNCTIONS ==== //

/**
 * This callback is performed after the Route has been
 * selected from the database
 * @callback getRouteCallback
 * @param {Error} error Database Query Error
 * @param {Route} [route] The selected Route
 */

/**
 * This callback is performed after the Routes have been
 * selected from the database
 * @callback getRoutesCallback
 * @param {Error} error Database Query Error
 * @param {Route[]} [routes] The selected Routes
 */




// ==== QUERY FUNCTIONS ==== //


// TODO: Accept multiple route IDs
/**
 * Get the Route (with its Agency) specified by the Route ID
 * from the passed database
 *
 * **package:** core.query.routes.getRoute()
 *
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {string} id Route ID
 * @param {getRouteCallback} callback getRoute callback function
 */
function getRoute(db, id, callback) {

  // Build the select statement
  let select = "SELECT gtfs_routes.route_id, gtfs_routes.route_short_name, " +
    "gtfs_routes.route_long_name, gtfs_routes.route_type, gtfs_routes.route_color, " +
    "gtfs_routes.route_text_color, " +
    "gtfs_agency.agency_id, gtfs_agency.agency_name, gtfs_agency.agency_url, " +
    "gtfs_agency.agency_timezone " +
    "FROM gtfs_routes, gtfs_agency " +
    "WHERE gtfs_routes.agency_id=gtfs_agency.agency_id AND " +
    "gtfs_routes.route_id='" + id + "';";

  // Query the database
  db.get(select, function(err, result) {

    // Database Query Error
    if ( err ) {
      return callback(
        new Error('Could not get Route ' + id + ' from database')
      );
    }

    // Create Agency
    let agency = new Agency(
      result.agency_name,
      result.agency_url,
      result.agency_timezone,
      result.agency_id
    );

    // Create Route
    let route = new Route(
      result.route_id,
      result.route_short_name,
      result.route_long_name,
      result.route_type,
      agency,
      result.route_color,
      result.route_text_color
    );

    // Return the Route with the callback
    return callback(null, route);

  });

}


/**
 * Get all of the Routes that are stored in the passed database
 *
 * **package:** core.query.routes.getRoutes()
 *
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {getRoutesCallback} callback getRoutes callback function
 */
function getRoutes(db, callback) {

  // Build the select statement
  let select = "SELECT gtfs_routes.route_id, gtfs_routes.route_short_name, " +
    "gtfs_routes.route_long_name, gtfs_routes.route_type, gtfs_routes.route_color, " +
    "gtfs_routes.route_text_color, " +
    "gtfs_agency.agency_id, gtfs_agency.agency_name, gtfs_agency.agency_url, " +
    "gtfs_agency.agency_timezone " +
    "FROM gtfs_routes, gtfs_agency " +
    "WHERE gtfs_routes.agency_id=gtfs_agency.agency_id";

  // Query the database
  db.select(select, function(err, results) {

    // Database Query Error
    if ( err ) {
      return callback(
        new Error('Could not get Routes from database')
      );
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
        row.agency_id
      );

      // Create Route
      let route = new Route(
        row.route_id,
        row.route_short_name,
        row.route_long_name,
        row.route_type,
        agency,
        row.route_color,
        row.route_text_color
      );

      // Add the route to the return list
      rtn.push(route);
    }

    // Return the route list with the callback
    rtn.sort(Route.sortByName);
    return callback(null, rtn);

  });

}



// Export Functions
module.exports = {
  getRoute : getRoute,
  getRoutes: getRoutes
};