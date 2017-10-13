'use strict';

/**
 * ### Stop Query Functions
 * These functions query the `gtfs_stops`, `rt_stops_extra` and
 * `rt_alt_stop_names` tables in the Right Track Database.
 * @module query/stops
 */

const cache = require('memory-cache');
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

  // Check cache for stop
  let cacheKey = db.id + "-" + stopIds;
  let cache = cache_stopById.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
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
      cache_stopById.put(cacheKey, rtn[0]);
      return callback(null, rtn[0]);
    }
    else {
      cache_stopById.put(cacheKey, rtn);
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

  // Check cache for Stop
  let cacheKey = db.id + "-" + name;
  let cache = cache_stopByName.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

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
        cache_stopByName.put(cacheKey, stop);
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

  // Check cache for stop
  let cacheKey = db.id + "-" + statusId;
  let cache = cache_stopByStatusId.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
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

    // Add Stop to cache
    cache_stopByStatusId.put(cacheKey, stop);

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

  // Check cache for stops
  let cacheKey = db.id + "-" + 'stops';
  let cache = cache_stops.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

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

    // Sort Stops By Name
    stops.sort(Stop.sortByName);

    // Add Stops to cache
    cache_stops.put(cacheKey, stops);

    // Return stops
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

  // Check cache for Stops
  let cacheKey = db.id + "-" + routeId;
  let cache = cache_stopsByRoute.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

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

      // Add Stops to Cache
      cache_stopsByRoute.put(cacheKey, stops);

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

  // Check cache for Stops
  let cacheKey = db.id + "-" + 'stopsWithStatus';
  let cache = cache_stopsWithStatus.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

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

    // Sort Stops By Name
    stops.sort(Stop.sortByName);

    // Add Stops to Cache
    cache_stopsWithStatus.put(cacheKey, stops);

    // Return Stops
    return callback(null, stops);

  });

}


/**
 * Get Stops sorted by distance from the specified location. Optionally filter
 * the returned stops to include up to `count` results and/or within `distance`
 * miles from the location.
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {number} lat Location latitude (decimal degrees)
 * @param {number} lon Location longitude (decimal degrees)
 * @param {int|undefined} count Max number of Stops to return
 * @param {number|undefined} distance Max distance (miles) Stops can be from location
 * @param {function} callback {@link module:query/stops~getStopsCallback|getStopsCallback} callback function
 */
function getStopsByLocation(db, lat, lon, count, distance, callback) {

  // Get all of the Stops
  getStops(db, function(err, stops) {
    if ( err || stops === undefined ) {
      return callback(err);
    }


    // Calc distance to/from each stop
    for ( let i = 0; i < stops.length; i++ ) {
      stops[i].setDistance(lat, lon);
    }

    // Sort by distance
    stops.sort(Stop.sortByDistance);



    // Filter the stops to return
    let rtn = [];


    // Return 'count' stops
    if ( count !== undefined ) {
      for ( let i = 0; i < count; i++ ) {
        if ( stops.length > i ) {
          rtn.push(stops[i]);
        }
      }
    }

    // No 'count' specified, add all stops
    else {
      rtn = stops;
    }


    // Filter by distance
    if ( distance !== undefined ) {
      let temp = [];
      for ( let i = 0; i < rtn.length; i++ ) {
        if ( rtn[i].distance <= distance ) {
          temp.push(rtn[i]);
        }
      }
      rtn = temp;
    }


    // Return the Stops
    return callback(null, rtn);

  });
}


// ==== SETUP CACHES ==== //
let cache_stopById = new cache.Cache();
let cache_stopByName = new cache.Cache();
let cache_stopByStatusId = new cache.Cache();
let cache_stops = new cache.Cache();
let cache_stopsByRoute = new cache.Cache();
let cache_stopsWithStatus = new cache.Cache();

/**
 * Clear the LinksTable caches
 * @private
 */
function clearCache() {
  cache_stopById.clear();
  cache_stopByName.clear();
  cache_stopByStatusId.clear();
  cache_stops.clear();
  cache_stopsByRoute.clear();
  cache_stopsWithStatus.clear();
}


// Export Functions
module.exports = {
  getStop: getStop,
  getStopByName: getStopByName,
  getStopByStatusId: getStopByStatusId,
  getStops: getStops,
  getStopsByRoute: getStopsByRoute,
  getStopsWithStatus: getStopsWithStatus,
  getStopsByLocation: getStopsByLocation,
  clearCache: clearCache
};