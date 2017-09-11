'use strict';

const Stop = require("../gtfs/Stop.js");


/**
 * Get the specified stop from the specified database
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {string} id Stop ID
 * @param {getStopCallback} callback GetStop callback function
 */
let getStop = function(db, id, callback) {

    // Build Select Statement
    let select = "SELECT gtfs_stops.stop_id, gtfs_stops.stop_name, gtfs_stops.stop_lat, " +
        "gtfs_stops.stop_lon, gtfs_stops.stop_url, gtfs_stops.wheelchair_boarding, " +
        "rt_stops_extra.status_id, rt_stops_extra.display_name, rt_stops_extra.transfer_weight " +
        "FROM gtfs_stops, rt_stops_extra " +
        "WHERE gtfs_stops.stop_id=rt_stops_extra.stop_id AND " +
        "gtfs_stops.stop_id='" + id + "';";

    // Query the database
    db.get(select, function(result) {

        // Build the Stop
        if ( result !== undefined ) {
            let final_name = result.stop_name;
            if ( result.display_name !== undefined && result.display_name !== "" ) {
                final_name = result.display_name;
            }

            let stop = new Stop(
                result.stop_id,
                final_name,
                result.stop_lat,
                result.stop_lon,
                result.stop_url,
                result.wheelchair_boarding,
                result.status_id,
                result.transfer_weight
            );

            callback(stop);
        }

    });

};



// ==== CALLBACK DEFINITIONS ==== //

/**
 * This callback is performed after a single Stop has been
 * selected from the database.
 * @callback getStopCallback
 * @param {Stop} stop The selected Stop
 */





module.exports = {
    getStop: getStop
};