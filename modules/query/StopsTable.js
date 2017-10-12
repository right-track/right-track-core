'use strict';

/**
 * ### Stop Query Functions
 * These functions query the `gtfs_stops`, `rt_stops_extra` and
 * `rt_alt_stop_names` tables in the Right Track Database.
 * @module query/stops
 */

const Stop = require('../gtfs/Stop.js');


// ==== CALLBACK FUNCTIONS ==== //

/**
 * This callback is performed after a single Stop has been
 * selected from the database.
 * @callback module:query/stops~getStopCallback
 * @param {Error} error Database Query Error
 * @param {Stop} [stop] The selected Stop
 */

/**
 * This callback is performed after multiple Stops have been
 * selected from the database.
 * @callback module:query/stops~getStopsCallback
 * @param {Error} error Database Query Error
 * @param {Stop[]} [stops] An array of the selected Stops
 */



// ==== QUERY FUNCTIONS ==== //

/**
 * Get the Stop(s) specified by ID(s) from the passed database
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {string|string[]} id Stop ID(s)
 * @param {function} callback {@link module:query/stops~getStopCallback|getStopCallback} or {@link module:query/stops~getStopsCallback|getStopsCallback} callback function
 */
function getStop(db, id, callback) {

  // Build stop id string
  let stopIds = "";
  if ( typeof id === 'string' || typeof id === 'number' ) {
    stopIds = "('" + id + "')";
  }
  else {
    try {
      stopIds = "('" + id.join("', '") + "')";
    }
    catch(err) {
      console.warn(err);
      stopIds = "('" + id + "')";
    }
  }


  // Build Select Statement
  let select = "SELECT gtfs_stops.stop_id, gtfs_stops.stop_name, gtfs_stops.stop_lat, " +
    "gtfs_stops.stop_lon, gtfs_stops.stop_url, gtfs_stops.wheelchair_boarding, " +
    "rt_stops_extra.status_id, rt_stops_extra.display_name, rt_stops_extra.transfer_weight " +
    "FROM gtfs_stops, rt_stops_extra " +
    "WHERE gtfs_stops.stop_id=rt_stops_extra.stop_id AND " +
    "gtfs_stops.stop_id IN " + stopIds + ";";

  // Query the database
  db.select(select, function(err, results) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // List of Stops to return
    let rtn = [];

    // Parse each returned stop...
    for ( let i = 0; i < results.length; i++ ) {
      let row = results[i];

      // Use rt display_name if provided
      let final_name = row.stop_name;
      if (row.display_name !== undefined && row.display_name !== "") {
        final_name = row.display_name;
      }

      // Set wheelchair boarding to unknown if status not in database
      let wheelchair_boarding = row.wheelchair_boarding;
      if (row.wheelchair_boarding === null) {
        wheelchair_boarding = Stop.WHEELCHAIR_BOARDING_UNKNOWN;
      }

      // build the Stop
      let stop = new Stop(
        row.stop_id,
        final_name,
        row.stop_lat,
        row.stop_lon,
        row.stop_url,
        wheelchair_boarding,
        row.status_id,
        row.transfer_weight
      );

      // Add stop to list
      rtn.push(stop);

    }

    // No Stop(s) found, return undefined
    if ( rtn.length === 0 ) {
      return callback(null, undefined);
    }

    // Return Stop(s)
    else if ( rtn.length === 1 ) {
      return callback(null, rtn[0]);
    }
    else {
      return callback(null, rtn);
    }

  });

}


/**
 * Get the Stop specified by name from the passed database
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {string} name Stop Name (found in either gtfs_stops, rt_alt_stop_names or rt_stops_extra tables)
 * @param {function} callback {@link module:query/stops~getStopCallback|getStopCallback} callback function
 */
function getStopByName(db, name, callback) {

  // Different queries to lookup stop by name
  let queries = [
    "SELECT stop_id FROM gtfs_stops WHERE stop_name='" + name + "' COLLATE NOCASE;",
    "SELECT stop_id FROM rt_alt_stop_names WHERE alt_stop_name='" + name + "' COLLATE NOCASE;",
    "SELECT stop_id FROM rt_stops_extra WHERE display_name='" + name + "' COLLATE NOCASE;"
  ];

  // Test each query for the stop name
  let found = false;
  let count = 0;
  for ( let i = 0; i < queries.length; i++ ) {

    // Perform the specified query
    _queryForStopByName(db, queries[i], function(stop) {

      // Return the result: if not already found and the query was successful
      if ( !found && stop !== undefined ) {
        found = true;
        return callback(null, stop);
      }

      // Return after all queries have finished
      count ++;
      if ( count === queries.length ) {
        return callback(null, undefined);
      }

    });
  }

}

/**
 * Perform a query searching for Stop by it's name
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {string} query The full SELECT query to perform
 * @param {function} callback Callback function accepting the Stop, if found
 * @private
 */
function _queryForStopByName(db, query, callback) {

  // Perform the search query
  db.get(query, function(err, result) {

    // No stop found, return undefined
    if ( result === undefined ) {
      return callback(undefined);
    }

    // Stop found, return the Stop from it's ID
    getStop(db, result.stop_id, function(err, stop) {
      return callback(stop);
    });

  });

}


/**
 * Get the Stop specified by status id from the passed database
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {string} statusId the status id of the Stop
 * @param {function} callback {@link module:query/stops~getStopCallback|getStopCallback} callback function
 */
function getStopByStatusId(db, statusId, callback) {

  // Make sure statusId is not -1
  if ( statusId === "-1" ) {
    return callback(
      new Error('Stop does not have a valid Status ID')
    );
  }


  // Build select statement
  let select = "SELECT gtfs_stops.stop_id, gtfs_stops.stop_name, gtfs_stops.stop_lat, " +
    "gtfs_stops.stop_lon, gtfs_stops.stop_url, gtfs_stops.wheelchair_boarding, " +
    "rt_stops_extra.status_id, rt_stops_extra.display_name, rt_stops_extra.transfer_weight " +
    "FROM gtfs_stops, rt_stops_extra " +
    "WHERE gtfs_stops.stop_id=rt_stops_extra.stop_id AND " +
    "rt_stops_extra.status_id='" + statusId + "';";

  // Query the database
  db.get(select, function(err, result) {

    // Database Error
    if ( err ) {
      return callback(err);
    }

    // No Stop found...
    if ( result === undefined ) {
      return callback(null, undefined);
    }

    // Use rt display_name if provided
    let final_name = result.stop_name;
    if ( result.display_name !== undefined && result.display_name !== "" ) {
      final_name = result.display_name;
    }

    // Set wheelchair boarding to unknown if status not in database
    let wheelchair_boarding = result.wheelchair_boarding;
    if ( result.wheelchair_boarding === null ) {
      wheelchair_boarding = Stop.WHEELCHAIR_BOARDING_UNKNOWN;
    }

    // build the Stop
    let stop = new Stop(
      result.stop_id,
      final_name,
      result.stop_lat,
      result.stop_lon,
      result.stop_url,
      wheelchair_boarding,
      result.status_id,
      result.transfer_weight
    );

    // return the Stop in the callback
    return callback(null, stop);

  });

}


/**
 * Get all of the Stops that are stored in the passed database
 * (sorted alphabetically)
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {function} callback {@link module:query/stops~getStopsCallback|getStopsCallback} callback function
 */
function getStops(db, callback) {

  // Build select statement
  let select = "SELECT gtfs_stops.stop_id, gtfs_stops.stop_name, gtfs_stops.stop_lat, " +
    "gtfs_stops.stop_lon, gtfs_stops.stop_url, gtfs_stops.wheelchair_boarding, " +
    "rt_stops_extra.status_id, rt_stops_extra.display_name, rt_stops_extra.transfer_weight " +
    "FROM gtfs_stops, rt_stops_extra " +
    "WHERE gtfs_stops.stop_id=rt_stops_extra.stop_id";

  // Query the database
  db.select(select, function(err, results) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // Array to hold stops to return
    let stops = [];

    // Parse each row
    for ( let i = 0; i < results.length; i++ ) {
      let row = results[i];

      // Use rt display_name if provided
      let final_name = row.stop_name;
      if ( row.display_name !== undefined && row.display_name !== "" ) {
        final_name = row.display_name;
      }

      // Set wheelchair boarding to unknown if status not in database
      let wheelchair_boarding = row.wheelchair_boarding;
      if ( row.wheelchair_boarding === null ) {
        wheelchair_boarding = Stop.WHEELCHAIR_BOARDING_UNKNOWN;
      }

      // build the Stop
      let stop = new Stop(
        row.stop_id,
        final_name,
        row.stop_lat,
        row.stop_lon,
        row.stop_url,
        wheelchair_boarding,
        row.status_id,
        row.transfer_weight
      );

      // Add stop to return array
      stops.push(stop);

    }

    // return the stops in the callback
    stops.sort(Stop.sortByName);
    return callback(null, stops);

  });

}



/**
 * Get all of the Stops that are associated with the
 * specified route (sorted alphabetically)
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {string} routeId The Route ID
 * @param {function} callback {@link module:query/stops~getStopsCallback|getStopsCallback} callback function
 */
function getStopsByRoute(db, routeId, callback) {

  // Build select statement
  // Get all Stop IDs that have a trip that uses the specified route
  let select = "SELECT DISTINCT stop_id FROM gtfs_stop_times WHERE trip_id IN " +
    "(SELECT DISTINCT trip_id FROM gtfs_trips WHERE route_id='" + routeId + "');";

  // Query the database
  db.select(select, function(err, results) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // Stop IDs to get
    let stopIds = [];

    // Parse each row of the results
    for ( let i = 0; i < results.length; i++ ) {
      let row = results[i];
      stopIds.push(row.stop_id);
    }

    // Build stops from the stop ids
    getStop(db, stopIds, function(err, stops) {

      if ( err ) {
        return callback(err);
      }

      // Return sorted stops with callback
      if ( stops !== undefined ) {
        stops.sort(Stop.sortByName);
      }
      return callback(null, stops);

    });

  });

}


/**
 * Get all of the Stops with a valid (!= -1) Status ID that are stored
 * in the passed database (sorted alphabetically)
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {function} callback {@link module:query/stops~getStopsCallback|getStopsCallback} callback function
 */
function getStopsWithStatus(db, callback) {

  // Build select statement
  let select = "SELECT gtfs_stops.stop_id, gtfs_stops.stop_name, gtfs_stops.stop_lat, " +
    "gtfs_stops.stop_lon, gtfs_stops.stop_url, gtfs_stops.wheelchair_boarding, " +
    "rt_stops_extra.status_id, rt_stops_extra.display_name, rt_stops_extra.transfer_weight " +
    "FROM gtfs_stops, rt_stops_extra " +
    "WHERE gtfs_stops.stop_id=rt_stops_extra.stop_id AND " +
    "rt_stops_extra.status_id <> '-1';";

  // Query the database
  db.select(select, function(err, results) {

    // Database query error
    if ( err ) {
      return callback(err);
    }

    // Array to hold stops to return
    let stops = [];

    // Parse each row
    for ( let i = 0; i < results.length; i++ ) {
      let row = results[i];

      // Use rt display_name if provided
      let final_name = row.stop_name;
      if ( row.display_name !== undefined && row.display_name !== "" ) {
        final_name = row.display_name;
      }

      // Set wheelchair boarding to unknown if status not in database
      let wheelchair_boarding = row.wheelchair_boarding;
      if ( row.wheelchair_boarding === null ) {
        wheelchair_boarding = Stop.WHEELCHAIR_BOARDING_UNKNOWN;
      }

      // build the Stop
      let stop = new Stop(
        row.stop_id,
        final_name,
        row.stop_lat,
        row.stop_lon,
        row.stop_url,
        wheelchair_boarding,
        row.status_id,
        row.transfer_weight
      );

      // Add stop to return array
      stops.push(stop);

    }

    // return the stops in the callback
    stops.sort(Stop.sortByName);
    return callback(null, stops);

  });

}

// TODO: Get Stops near location
// TODO: Get closest stop to location


// Export Functions
module.exports = {
  getStop: getStop,
  getStopByName: getStopByName,
  getStopByStatusId: getStopByStatusId,
  getStops: getStops,
  getStopsByRoute: getStopsByRoute,
  getStopsWithStatus: getStopsWithStatus
};