'use strict';

const Stop = require("../gtfs/Stop.js");
const StopTime = require("../gtfs/StopTime.js");


// ==== CALLBACK FUNCTIONS ==== //

/**
 * This callback is performed after the StopTimes has been
 * selected from the database
 * @callback getStopTimeCallback
 * @param {StopTime} stopTime The selected StopTime
 */

/**
 * This callback is performed after the StopTimes have been
 * selected from the database
 * @callback getStopTimesCallback
 * @param {StopTime[]} stopTimes The selected StopTimes
 */




// ==== QUERY FUNCTIONS ==== //


/**
 * Get the list of StopTimes for the specified Trip
 * from the passed database (sorted by stop sequence)
 *
 * **package:** core.query.stoptimes.getStopTimesByTrip()
 *
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {string} tripId Trip ID
 * @param {getStopTimesCallback} callback getStopTimes callback function
 */
let getStopTimesByTrip = function(db, tripId, callback) {

    // Build the select statement
    let select = "SELECT " +
        "gtfs_stop_times.arrival_time, arrival_time_seconds, departure_time, departure_time_seconds, stop_sequence, pickup_type, drop_off_type, " +
        "gtfs_stops.stop_id, stop_name, stop_lat, stop_lon, stop_url, wheelchair_boarding, " +
        "rt_stops_extra.display_name, status_id, transfer_weight " +
        "FROM gtfs_stop_times " +
        "INNER JOIN gtfs_stops ON gtfs_stop_times.stop_id=gtfs_stops.stop_id " +
        "INNER JOIN rt_stops_extra ON gtfs_stops.stop_id=rt_stops_extra.stop_id " +
        "WHERE gtfs_stop_times.trip_id='" + tripId + "' " +
        "ORDER BY gtfs_stop_times.stop_sequence; ";

    // Query the database
    db.select(select, function(results) {

        // List of StopTimes to return
        let rtn = [];

        // Parse the database result...
        if ( results !== undefined ) {

            // Parse each row of the results...
            for ( let i = 0; i < results.length; i++ ) {
                let row = results[i];

                // Use the stop_name by default unless display_name is set
                let stop_name = row.stop_name;
                if ( row.display_name !== undefined && row.display_name !== null && row.display_name !== "" ) {
                    stop_name = row.display_name;
                }

                // Build Stop
                let stop = new Stop(
                    row.stop_id,
                    stop_name,
                    row.stop_lat,
                    row.stop_lon,
                    row.stop_url,
                    row.wheelchair_boarding,
                    row.status_id,
                    row.transfer_weight
                );

                // Build StopTime
                let stopTime = new StopTime(
                    stop,
                    row.arrival_time,
                    row.departure_time,
                    row.stop_sequence,
                    row.arrival_time_seconds,
                    row.departure_time_seconds,
                    row.pickup_type,
                    row.drop_off_type
                );

                // Add stoptime to list
                rtn.push(stopTime);
            }

        }

        // Return the StopTimes with the callback
        if ( callback !== undefined ) {
            callback(rtn);
        }

    });

};


/**
 * Get the StopTime for the specified Trip and the
 * specified Stop from the passed database
 *
 * **package:** core.query.stoptimes.getStopTimeByTripStop()
 *
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {string} tripId Trip ID
 * @param {string} stopId Stop ID
 * @param {getStopTimeCallback} callback getStopTime callback function
 */
let getStopTimeByTripStop = function(db, tripId, stopId, callback) {

    // Build the select statement
    let select = "SELECT " +
        "gtfs_stop_times.arrival_time, arrival_time_seconds, departure_time, departure_time_seconds, stop_sequence, pickup_type, drop_off_type, " +
        "gtfs_stops.stop_id, stop_name, stop_lat, stop_lon, stop_url, wheelchair_boarding, " +
        "rt_stops_extra.display_name, status_id, transfer_weight " +
        "FROM gtfs_stop_times " +
        "INNER JOIN gtfs_stops ON gtfs_stop_times.stop_id=gtfs_stops.stop_id " +
        "INNER JOIN rt_stops_extra ON gtfs_stops.stop_id=rt_stops_extra.stop_id " +
        "WHERE gtfs_stop_times.trip_id='" + tripId + "' " +
        "AND gtfs_stop_times.stop_id='" + stopId + "';";

    // Query the database
    db.get(select, function(result) {

        // Parse the database result...
        if ( result !== undefined ) {

            // Use the stop_name by default unless display_name is set
            let stop_name = result.stop_name;
            if ( result.display_name !== undefined && result.display_name !== null && result.display_name !== "" ) {
                stop_name = result.display_name;
            }

            // Build Stop
            let stop = new Stop(
                result.stop_id,
                stop_name,
                result.stop_lat,
                result.stop_lon,
                result.stop_url,
                result.wheelchair_boarding,
                result.status_id,
                result.transfer_weight
            );

            // Build StopTime
            let stopTime = new StopTime(
                stop,
                result.arrival_time,
                result.departure_time,
                result.stop_sequence,
                result.arrival_time_seconds,
                result.departure_time_seconds,
                result.pickup_type,
                result.drop_off_type
            );


            // Return the StopTimes with the callback
            if ( callback !== undefined ) {
                callback(stopTime);
            }

        }

    });

};



// Export Functions
module.exports = {
    getStopTimesByTrip: getStopTimesByTrip,
    getStopTimeByTripStop: getStopTimeByTripStop
};