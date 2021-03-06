'use strict';

/**
 * ### Stop Query Functions
 * These functions query the `gtfs_stops`, `rt_stops_extra` and
 * `rt_alt_stop_names` tables in the Right Track Database.
 * @module query/stops
 */


const cache = require('memory-cache');
const provided = require('../utils/provided.js');
const Stop = require('../gtfs/Stop.js');



// ==== QUERY FUNCTIONS ==== //

/**
 * Get the Stop(s) specified by ID(s) from the passed database
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {string|string[]} id Stop ID(s)
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Stop|Stop[]} [callback.stop] The selected Stop(s)
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
  let select = "SELECT gtfs_stops.stop_id, stop_name, stop_desc, stop_lat, stop_lon, stop_url, " +
    "gtfs_stops.zone_id AS gtfs_zone_id, stop_code, wheelchair_boarding, location_type, parent_station, stop_timezone, " +
    "rt_stops_extra.status_id, display_name, transfer_weight, rt_stops_extra.zone_id AS rt_zone_id " +
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

      // Get zone_id from rt_stops_extra if not defined if gtfs_stops
      let zone_id = row.gtfs_zone_id;
      if ( zone_id === null || zone_id === undefined ) {
        zone_id = row.rt_zone_id;
      }

      // build the Stop
      let stop = new Stop(
        row.stop_id,
        final_name,
        row.stop_lat,
        row.stop_lon,
        {
          code: row.stop_code,
          description: row.stop_desc,
          zoneId: zone_id,
          url: row.stop_url,
          locationType: row.location_type,
          parentStation: row.parent_station,
          timezone: row.stop_timezone,
          wheelchairBoarding: row.wheelchair_boarding,
          statusId: row.status_id,
          transferWeight: row.transfer_weight
        }
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
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Stop} [callback.stop] The selected Stop
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
 * @param {function} callback Callback function(Stop)
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
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Stop} [callback.stop] The selected Stop
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
  let select = "SELECT gtfs_stops.stop_id, stop_name, stop_desc, stop_lat, stop_lon, stop_url, " +
    "gtfs_stops.zone_id AS gtfs_zone_id, stop_code, wheelchair_boarding, location_type, parent_station, stop_timezone, " +
    "rt_stops_extra.status_id, display_name, transfer_weight, rt_stops_extra.zone_id AS rt_zone_id " +
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

    // Get zone_id from rt_stops_extra if not defined in gtfs_stops
    let zone_id = result.gtfs_zone_id;
    if ( zone_id === null || zone_id === undefined ) {
      zone_id = result.rt_zone_id;
    }

    // build the Stop
    let stop = new Stop(
      result.stop_id,
      final_name,
      result.stop_lat,
      result.stop_lon,
      {
        code: result.stop_code,
        description: result.stop_desc,
        zoneId: zone_id,
        url: result.stop_url,
        locationType: result.location_type,
        parentStation: result.parent_station,
        timezone: result.stop_timezone,
        wheelchairBoarding: result.wheelchair_boarding,
        statusId: result.status_id,
        transferWeight: result.transfer_weight
      }
    );

    // Add Stop to cache
    cache_stopByStatusId.put(cacheKey, stop);

    // return the Stop in the callback
    return callback(null, stop);

  });

}


/**
 * Get all of the Stops that are stored in the passed database (sorted alphabetically),
 * optionally filtered to only include Stops that support real-time Station Feeds.
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {boolean} [hasFeed=false] When true, only return Stops that support real-time Station Feeds.
 * When false, include all Stops.
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Stop[]} [callback.stops] The selected Stops
 */
function getStops(db, hasFeed, callback) {

  // Process args
  if ( callback === undefined && typeof hasFeed === 'function' ) {
    callback = hasFeed;
    hasFeed = false;
  }

  // Check cache for stops
  let cacheKey = db.id + "-stops-" + hasFeed;
  let cache = cache_stops.get(cacheKey);
  if ( cache !== null ) {
    cache.sort(Stop.sortByName);
    return callback(null, cache);
  }

  // Build select statement
  let select = "SELECT gtfs_stops.stop_id, stop_name, stop_desc, stop_lat, stop_lon, stop_url, " +
    "gtfs_stops.zone_id AS gtfs_zone_id, stop_code, wheelchair_boarding, location_type, parent_station, stop_timezone, " +
    "rt_stops_extra.status_id, display_name, transfer_weight, rt_stops_extra.zone_id AS rt_zone_id " +
    "FROM gtfs_stops, rt_stops_extra " +
    "WHERE gtfs_stops.stop_id=rt_stops_extra.stop_id";

  // Filter Stops by status id
  if ( hasFeed ) {
    select = select + " AND rt_stops_extra.status_id <> '-1'";
  }

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

      // Get zone_id from rt_stops_extra if not defined if gtfs_stops
      let zone_id = row.gtfs_zone_id;
      if ( zone_id === null || zone_id === undefined ) {
        zone_id = row.rt_zone_id;
      }

      // build the Stop
      let stop = new Stop(
        row.stop_id,
        final_name,
        row.stop_lat,
        row.stop_lon,
        {
          code: row.stop_code,
          description: row.stop_desc,
          zoneId: zone_id,
          url: row.stop_url,
          locationType: row.location_type,
          parentStation: row.parent_station,
          timezone: row.stop_timezone,
          wheelchairBoarding: row.wheelchair_boarding,
          statusId: row.status_id,
          transferWeight: row.transfer_weight
        }
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
 * Get all of the Stops that are associated with the specified route (sorted alphabetically),
 * optionally filtered to only include Stops that support real-time Station Feeds.
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {string} routeId The Route ID
 * @param {boolean} [hasFeed=false] When true, only return Stops on Route that support
 * real-time Station Feeds. When false, include all Stops on Route.
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Stop[]} [callback.stops] The selected Stops
 */
function getStopsByRoute(db, routeId, hasFeed, callback) {

  // Parse Args
  if ( callback === undefined && typeof hasFeed === 'function' ) {
    callback = hasFeed;
    hasFeed = false;
  }

  // Check cache for Stops
  let cacheKey = db.id + "-" + routeId + "-" + hasFeed;
  let cache = cache_stopsByRoute.get(cacheKey);
  if ( cache !== null ) {
    cache.sort(Stop.sortByName);
    return callback(null, cache);
  }

  // Build select statement
  // Get all Stop IDs that have a trip that uses the specified route
  let select = "SELECT DISTINCT gtfs_stop_times.stop_id FROM gtfs_stop_times, rt_stops_extra " +
    "WHERE trip_id IN (SELECT DISTINCT trip_id FROM gtfs_trips WHERE route_id='" + routeId + "')";

  // Filter by Status ID
  if ( hasFeed ) {
    select = select + " AND gtfs_stop_times.stop_id=rt_stops_extra.stop_id AND rt_stops_extra.status_id <> '-1';"
  }

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

      // Make sure stops is an array
      if ( stops === undefined ) {
        stops = [];
      }

      // Return sorted stops with callback
      stops.sort(Stop.sortByName);

      // Add Stops to Cache
      cache_stopsByRoute.put(cacheKey, stops);

      return callback(null, stops);

    });

  });

}



/**
 * Get Stops sorted by distance from the specified location. Optionally, filter
 * the returned stops to include up to `count` results and/or within `distance`
 * miles from the location. Also, the returned Stops can be filtered to include
 * only Stops that support real-time Station Feeds and/or are associated with a
 * specific Route.
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {number} lat Location latitude (decimal degrees)
 * @param {number} lon Location longitude (decimal degrees)
 * @param {Object} [options] Filter Options
 * @param {int} [options.count] Max number of Stops to return
 * @param {number} [options.distance] Max distance (miles) Stops can be from location
 * @param {boolean} [options.hasFeed] When true, only return Stops that support
 * real-time Station Feeds. Otherwise include all matching Stops.
 * @param {string} [options.routeId] When provided with a GTFS Route ID, return only Stops
 * associated with the Route
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Stop[]} [callback.stops] The selected Stops
 */
function getStopsByLocation(db, lat, lon, options, callback) {

  // Parse Args
  if ( callback === undefined && typeof options === 'function' ) {
    callback = options;
    options = {};
  }

  // Get options
  let hasFeed = provided(options.hasFeed, false);
  let routeId = provided(options.routeId);
  let count = provided(options.count, -1);
  let distance = provided(options.distance, -1);

  // Get Stops By Route
  if ( routeId !== undefined ) {
    getStopsByRoute(db, routeId, hasFeed, function(err, stops) {

      // Query Error
      if ( err ) {
        return callback(err);
      }

      // Parse Stops
      _parseStopsByLocation(stops, lat, lon, count, distance, callback);

    });
  }

  // Get all of the Stops
  else {
    getStops(db, hasFeed, function (err, stops) {

      // Query Error
      if ( err ) {
        return callback(err);
      }

      // Parse Stops
      _parseStopsByLocation(stops, lat, lon, count, distance, callback);

    });
  }

}


/**
 * Parse the Stops by the Location Information
 * @param {Stop[]} stops List of Stops to parse
 * @param {number} lat Location Latitude
 * @param {number} lon Location Longitude
 * @param {int} count Max number of stops to return (-1 for unlimited)
 * @param {number} distance Max distance from location (-1 for no limit)
 * @param {function} callback Callback function(err, stops)
 * @private
 */
function _parseStopsByLocation(stops, lat, lon, count, distance, callback) {

  // Calc distance to/from each stop
  for ( let i = 0; i < stops.length; i++ ) {
    stops[i].setDistance(lat, lon);
  }

  // Sort by distance
  stops.sort(Stop.sortByDistance);


  // Filter the stops to return
  let rtn = [];


  // Return 'count' stops
  if ( count !== -1 ) {
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
  if ( distance !== -1 ) {
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

}



// ==== SETUP CACHES ==== //
let cache_stopById = new cache.Cache();
let cache_stopByName = new cache.Cache();
let cache_stopByStatusId = new cache.Cache();
let cache_stops = new cache.Cache();
let cache_stopsByRoute = new cache.Cache();

/**
 * Clear the StopsTable caches
 * @private
 */
function clearCache() {
  cache_stopById.clear();
  cache_stopByName.clear();
  cache_stopByStatusId.clear();
  cache_stops.clear();
  cache_stopsByRoute.clear();
}


// Export Functions
module.exports = {
  getStop: getStop,
  getStopByName: getStopByName,
  getStopByStatusId: getStopByStatusId,
  getStops: getStops,
  getStopsByRoute: getStopsByRoute,
  getStopsByLocation: getStopsByLocation,
  clearCache: clearCache
};