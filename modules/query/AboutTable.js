'use strict';

/**
 * ### About Query Functions
 * These functions query the `rt_about` table in the Right Track Database.
 * @module query/about
 */


const cache = require('memory-cache');
const About = require('../rt/About.js');


// ==== CALLBACK FUNCTIONS ==== //

/**
 * This callback is performed after the database metadata
 * from the rt_about table has been queried from the database.
 * @callback module:query/about~getAboutCallback
 * @param {Error} error Database Query Error
 * @param {About} [about] The database About information
 */



// ==== QUERY FUNCTIONS ==== //

/**
 * Get the data stored in the rt_about table from the
 * passed database.
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {function} callback {@link module:query/about~getAboutCallback|getAboutCallback} callback function
 */
function getAbout(db, callback) {

  // Check for cached item
  let cacheKey = db.id + "-" + 'about';
  let cache = cache_about.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Build select statement
  let select = "SELECT compile_date, gtfs_publish_date, start_date, " +
    "end_date, version, notes FROM rt_about";

  // Query the database
  db.get(select, function(err, result) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // No About info returned
    if ( result === undefined ) {
      return callback(
        new Error('Could not get About info from Right Track DB')
      );
    }

    // Build and return About
    let about = new About(
      result.compile_date,
      result.gtfs_publish_date,
      result.start_date,
      result.end_date,
      result.version,
      result.notes
    );

    // Add about to cache
    cache_about.put(cacheKey, about);

    return callback(null, about);

  });

}


// ==== SETUP CACHE ==== //
let cache_about = new cache.Cache();

/**
 * Clear the AboutTable cache
 * @private
 */
function clearCache() {
  cache_about.clear();
}


// Export Functions
module.exports = {
  getAbout: getAbout,
  clearCache: clearCache
};