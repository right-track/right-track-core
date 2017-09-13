'use strict';

const About = require("../rt/About.js");


// ==== CALLBACK FUNCTIONS ==== //

/**
 * This callback is performed after the database metadata
 * from the rt_about table has been queried from the database.
 * @callback getAboutCallback
 * @param {About} about The database About information
 */



// ==== QUERY FUNCTIONS ==== //

/**
 * Get the data stored in the rt_about table from the
 * passed database.
 *
 * **package:** core.query.about.getAbout()
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {getAboutCallback} callback getAbout callback function
 */
let getAbout = function(db, callback) {

    // Build select statement
    let select = "SELECT compile_date, gtfs_publish_date, start_date, " +
        "end_date, version, notes FROM rt_about";

    // Query the database
    db.get(select, function(result) {

        // Build the About object
        if ( result !== undefined ) {

            let about = new About(
                result.compile_date,
                result.gtfs_publish_date,
                result.start_date,
                result.end_date,
                result.version,
                result.notes
            );

            // return About with callback
            if ( callback !== undefined ) {
                callback(about);
            }

        }

    });

};


// Export Functions
module.exports = {
    getAbout: getAbout
};