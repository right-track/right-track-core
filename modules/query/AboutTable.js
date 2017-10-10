'use strict';

/**
 * ### About Query Functions
 * These functions query the `rt_about` table in the Right Track Database.
 * @module query/about
 */


const About = require('../rt/About.js');


// ==== CALLBACK FUNCTIONS ==== //

/**
 * This callback is performed after the database metadata
 * from the rt_about table has been queried from the database.
 * @callback getAboutCallback
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
    
    return callback(null, about);

  });

}


// Export Functions
module.exports = {
  getAbout: getAbout
};