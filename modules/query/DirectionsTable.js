'use strict';

/**
 * ### Direction Query Functions
 * These functions query the `gtfs_directions` table in the Right Track Database.
 * @module query/directions
 */


const cache = require('memory-cache');
const Direction = require('../gtfs/Direction.js');



// ==== QUERY FUNCTIONS ==== //

/**
 * Get the directions stored in the gtfs_directions table from 
 * the passed database.
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Direction[]} [callback.directions] The directions (id and description)
 */
function getDirections(db, callback) {

  // Check for cached item
  let cacheKey = db.id + "-" + 'directions';
  let cache = cache_directions.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Build select statement
  let select = "SELECT direction_id, description FROM gtfs_directions";

  // Query the database
  db.select(select, function(err, results) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // No Directions returned
    if ( results === undefined || results.length === 0) {
      return callback(
        new Error('Right Track DB does not have directions defined')
      );
    }

    // Build the Directions
    let directions = [];
    for ( let i = 0; i < results.length; i++ ) {
      directions.push(new Direction(
        results[i].direction_id, 
        results[i].description
      ));
    }

    // Add directions to cache
    cache_directions.put(cacheKey, directions);

    return callback(null, directions);

  });

}

/**
 * Get the specified direction stored in the gtfs_directions table 
 * from the passed database.
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {String} id The Direction ID
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Direction} [callback.direction] The direction (id and description)
 */
function getDirection(db, id, callback) {

  // Check for cached item
  let cacheKey = db.id + "-direction-" + id;
  let cache = cache_directions.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Build select statement
  let select = "SELECT direction_id, description FROM gtfs_directions WHERE direction_id = '" + id + "'";

  // Query the database
  db.get(select, function(err, result) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // No Direction returned
    if ( result === undefined ) {
      return callback(
        new Error('Right Track DB does not have direction defined')
      );
    }

    // Build the Direction
    let direction = new Direction(result.direction_id, result.description);

    // Add directions to cache
    cache_directions.put(cacheKey, direction);

    return callback(null, direction);

  });

}


// ==== SETUP CACHE ==== //
let cache_directions = new cache.Cache();

/**
 * Clear the DirectionsTable cache
 * @private
 */
function clearCache() {
  cache_directions.clear();
}


// Export Functions
module.exports = {
  getDirections: getDirections,
  getDirection: getDirection,
  clearCache: clearCache
};