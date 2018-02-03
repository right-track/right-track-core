'use strict';

/**
 * ### Route Graph Query Functions
 * These functions query the `rt_route_graph` table in the Right Track Database.
 * @module query/routegraph
 */

const cache = require('memory-cache');
const Stop = require('../gtfs/Stop.js');


// ==== QUERY FUNCTIONS ==== //

/**
 * Get the possible next stops from the Route Graph.
 *
 * This will return a list of all Stops that directly proceed the specified
 * Stop in the specified direction on at least 1 Trip in the GTFS schedule
 * (regardless of the day/time).
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {string} id Stop ID
 * @param {int} direction Direction ID
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Stop[]} [callback.stops] List of possible next Stops
 *
 * @deprecated The rt_route_graph table is likely to be removed in the future
 */
function getNextStops(db, id, direction, callback) {

  // Check cache for stops
  let cacheKey = db.id + "-" + id + "-" + direction;
  let cache = cache_nextStops.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Build Select Statement
  let select = "SELECT gtfs_stops.stop_id, gtfs_stops.stop_name, gtfs_stops.stop_lat, " +
    "gtfs_stops.stop_lon, gtfs_stops.stop_url, gtfs_stops.wheelchair_boarding, " +
    "rt_stops_extra.status_id, rt_stops_extra.display_name, rt_stops_extra.transfer_weight " +
    "FROM gtfs_stops, rt_stops_extra " +
    "WHERE gtfs_stops.stop_id=rt_stops_extra.stop_id AND " +
    "gtfs_stops.stop_id IN (" +
    "SELECT stop2_id FROM rt_route_graph " +
    "WHERE stop1_id='" + id + "' AND direction_id=" + direction + "" +
    ");";

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
        {
          url: row.stop_url,
          wheelchairBoarding: wheelchair_boarding,
          statusId: row.status_id,
          transferWeight: row.transfer_weight
        }
      );

      // Add stop to list
      rtn.push(stop);

    }

    // Return Stop(s)
    cache_nextStops.put(cacheKey, rtn);
    return callback(null, rtn);

  });

}



// ==== SETUP CACHES ==== //
let cache_nextStops = new cache.Cache();


/**
 * Clear the RouteGraphTable caches
 * @private
 */
function clearCache() {
  cache_nextStops.clear();
}


// Export Functions
module.exports = {
  getNextStops: getNextStops,
  clearCache: clearCache
};