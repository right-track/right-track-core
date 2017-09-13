'use strict';

const Stop = require("../gtfs/Stop.js");


// ==== CALLBACK FUNCTIONS ==== //

/**
 * This callback is performed after a single Stop has been
 * selected from the database.
 * @callback getStopCallback
 * @param {Stop} stop The selected Stop
 */

/**
 * This callback is performed after multiple Stops have been
 * selected from the database.
 * @callback getStopsCallback
 * @param {Stop[]} stops An array of the selected Stops
 */



// ==== QUERY FUNCTIONS ==== //

/**
 * Get the Stop specified by ID from the passed database
 *
 * **package:** core.query.stops.getStop()
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {string} id Stop ID
 * @param {getStopCallback} callback getStop callback function
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
            if ( callback !== undefined ) {
                callback(stop);
            }
        }

        // Could not find matching stop
        else {
            console.error("Could not find matching Stop with id: " + id);
        }

    });

};


/**
 * Get the Stop specified by name from the passed database
 *
 * **package:** core.query.stops.getStopByName()
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {string} name Stop Name (found in either gtfs_stops, rt_alt_stop_names or rt_stops_extra tables)
 * @param {getStopCallback} callback getStop callback function
 */
let getStopByName = function(db, name, callback) {

    // Get stop id for name in gtfs_stops
    let select = "SELECT stop_id FROM gtfs_stops WHERE stop_name='" + name + "' COLLATE NOCASE;";

    // Query database for stop
    db.get(select, function(result) {

        // Stop not found in gtfs_stops...
        if ( result === undefined ) {

            // Check rt_alt_stop_names for stop name
            let select = "SELECT stop_id FROM rt_alt_stop_names WHERE alt_stop_name='" + name + "' COLLATE NOCASE;";

            // Query database for stop
            db.get(select, function(result) {

                // Stop not found in rt_alt_stop_names...
                if ( result === undefined ) {

                    // Check rt_stops_extra for stop name
                    let select = "SELECT stop_id FROM rt_stops_extra WHERE display_name='" + name + "' COLLATE NOCASE;";

                    // Query the database for stop
                    db.get(select, function(result) {

                        // Stop not found in rt_stops_extra
                        if ( result === undefined ) {
                            console.error("Could not look up stop by name: " + name);
                        }

                        // Stop found in rt_stops_extra
                        else {
                            getStop(db, result.stop_id, callback);
                        }

                    });

                }

                // Stop found in rt_alt_stop_names...
                else {
                    getStop(db, result.stop_id, callback);
                }

            });

        }

        // Stop found in gtfs_stops
        else {
            getStop(db, result.stop_id, callback);
        }

    })

};


/**
 * Get the Stop specified by status id from the passed database
 *
 * **package:** core.query.stops.getStopByStatusId()
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {string} statusId the status id of the Stop
 * @param {getStopCallback} callback getStop callback function
 */
let getStopByStatusId = function(db, statusId, callback) {

    // Make sure statusId is not -1
    if ( statusId !== "-1" ) {

        // Build select statement
        let select = "SELECT gtfs_stops.stop_id, gtfs_stops.stop_name, gtfs_stops.stop_lat, " +
            "gtfs_stops.stop_lon, gtfs_stops.stop_url, gtfs_stops.wheelchair_boarding, " +
            "rt_stops_extra.status_id, rt_stops_extra.display_name, rt_stops_extra.transfer_weight " +
            "FROM gtfs_stops, rt_stops_extra " +
            "WHERE gtfs_stops.stop_id=rt_stops_extra.stop_id AND " +
            "rt_stops_extra.status_id='" + statusId + "';";

        // Query the database
        db.get(select, function(result) {

            // Build the Stop
            if ( result !== undefined ) {

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
                if ( callback !== undefined ) {
                    callback(stop);
                }
            }

            // Could not find matching Stop...
            else {
                console.error("Could not find matching Stop with Status ID: " + statusId);
            }

        });

    }

};


/**
 * Get all of the Stops that are stored in the passed database.
 *
 * **package:** core.query.stops.getStops()
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {getStopsCallback} callback getStops callback function
 */
let getStops = function(db, callback) {

    // Build select statement
    let select = "SELECT gtfs_stops.stop_id, gtfs_stops.stop_name, gtfs_stops.stop_lat, " +
        "gtfs_stops.stop_lon, gtfs_stops.stop_url, gtfs_stops.wheelchair_boarding, " +
        "rt_stops_extra.status_id, rt_stops_extra.display_name, rt_stops_extra.transfer_weight " +
        "FROM gtfs_stops, rt_stops_extra " +
        "WHERE gtfs_stops.stop_id=rt_stops_extra.stop_id";

    // Query the database
    db.select(select, function(results) {

        // Parse results, if returned
        if ( results !== undefined ) {

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
            if ( callback !== undefined ) {
                callback(stops);
            }

        }

    });

};


/**
 * Get all of the Stops with a valid (!= -1) Status ID that are stored
 * in the passed database.
 *
 * **package:** core.query.stops.getStopsWithStatus()
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {getStopsCallback} callback getStops callback function
 */
let getStopsWithStatus = function(db, callback) {

    // Build select statement
    let select = "SELECT gtfs_stops.stop_id, gtfs_stops.stop_name, gtfs_stops.stop_lat, " +
        "gtfs_stops.stop_lon, gtfs_stops.stop_url, gtfs_stops.wheelchair_boarding, " +
        "rt_stops_extra.status_id, rt_stops_extra.display_name, rt_stops_extra.transfer_weight " +
        "FROM gtfs_stops, rt_stops_extra " +
        "WHERE gtfs_stops.stop_id=rt_stops_extra.stop_id AND " +
        "rt_stops_extra.status_id <> '-1';";

    // Query the database
    db.select(select, function(results) {

        // Parse results, if returned
        if ( results !== undefined ) {

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
            if ( callback !== undefined ) {
                callback(stops);
            }

        }

    });

};


// Export Functions
module.exports = {
    getStop: getStop,
    getStopByName: getStopByName,
    getStopByStatusId: getStopByStatusId,
    getStops: getStops,
    getStopsWithStatus: getStopsWithStatus
};