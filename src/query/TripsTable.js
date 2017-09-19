'use strict';

const DateTime = require("../utils/DateTime.js");
const Agency = require("../gtfs/Agency.js");
const Route = require("../gtfs/Route.js");
const Service = require("../gtfs/Service.js");
const ServiceException = require("../gtfs/ServiceException.js");
const Stop = require("../gtfs/Stop.js");
const StopTime = require("../gtfs/StopTime.js");
const Trip = require("../gtfs/Trip.js");
const CalendarTable = require("./CalendarTable.js");
const StopTimesTable = require("./StopTimesTable.js");


// ==== CALLBACK FUNCTIONS ==== //

/**
 * This callback is performed after the Trip has been
 * selected from the database
 * @callback getTripCallback
 * @param {Trip} trip The selected Trip
 */

/**
 * This callback is performed after the Trips have been
 * selected from the database
 * @callback getTripsCallback
 * @param {Trip[]} trips The selected Trips
 */




// ==== QUERY FUNCTIONS ==== //


/**
 * Get the Trip (with Route, Service and StopTimes) specified by
 * the Trip ID from the passed database
 *
 * **package:** core.query.trips.getTrip()
 *
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {string} id Trip ID
 * @param {int} date The date (yyyymmdd) that the Trip operates on
 * @param {getTripCallback} callback getTrip callback function
 */
let getTrip = function(db, id, date, callback) {

    // Build the select statement
    let select = "SELECT " +
        "gtfs_trips.trip_id, trip_short_name, wheelchair_accessible, service_id, " +
        "gtfs_directions.direction_id, description, " +
        "gtfs_routes.route_id, route_short_name, route_long_name, route_type, route_color, route_text_color, " +
        "gtfs_agency.agency_id, agency_name, agency_url, agency_timezone, " +
        "gtfs_stop_times.arrival_time, arrival_time_seconds, departure_time, departure_time_seconds, stop_sequence, pickup_type, drop_off_type, " +
        "gtfs_stops.stop_id, stop_name, stop_lat, stop_lon, stop_url, wheelchair_boarding, " +
        "rt_stops_extra.display_name, status_id, transfer_weight " +
        "FROM gtfs_trips " +
        "INNER JOIN gtfs_directions ON gtfs_trips.direction_id=gtfs_directions.direction_id " +
        "INNER JOIN gtfs_routes ON gtfs_trips.route_id=gtfs_routes.route_id " +
        "INNER JOIN gtfs_agency ON gtfs_routes.agency_id=gtfs_agency.agency_id " +
        "INNER JOIN gtfs_stop_times ON gtfs_trips.trip_id=gtfs_stop_times.trip_id " +
        "INNER JOIN gtfs_stops ON gtfs_stop_times.stop_id=gtfs_stops.stop_id " +
        "INNER JOIN rt_stops_extra ON gtfs_stops.stop_id=rt_stops_extra.stop_id " +
        "WHERE gtfs_trips.trip_id='" + id + "';";

    // Query the database
    db.select(select, function(results) {

        // Parse the database result...
        if ( results !== undefined && results.length > 0 ) {

            // Get Agency and Route info from first row
            let row = results[0];

            // Build Agency
            let agency = new Agency(
                row.agency_name,
                row.agency_url,
                row.agency_timezone,
                row.agency_id
            );

            // Build Route
            let route = new Route(
                row.route_id,
                row.route_short_name,
                row.route_long_name,
                row.route_type,
                agency,
                row.route_color,
                row.route_text_color
            );

            // Get Service from service id
            CalendarTable.getService(db, row.service_id, function(service) {

                // List of StopTimes
                let stopTimes = [];

                // Get StopTimes
                for ( let i = 0; i < results.length; i++ ) {
                    let row = results[i];

                    // Use display name for stop name, if present
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
                        row.drop_off_type,
                        date
                    );

                    // Add stop time to list
                    stopTimes.push(stopTime);
                }

                // Build Trip
                let trip = new Trip(
                    id,
                    route,
                    service,
                    stopTimes,
                    row.trip_short_name,
                    row.direction_id,
                    row.wheelchair_accessible,
                    row.description
                );

                // Return trip with callback
                if ( callback !== undefined ) {
                    callback(trip);
                }

            })

        }

    });

};


/**
 * Find the Trip that leaves the specified origin Stop for the specified
 * destination Stop at the departure time specified by the dateTime
 *
 * **package:** core.query.trips.getTripByDeparture()
 *
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {string} originId Origin Stop ID
 * @param {string} destinationId Destination Stop ID
 * @param {DateTime} dateTime
 * @param {getTripCallback} callback getTrip callback function
 */
let getTripByDeparture = function(db, originId, destinationId, dateTime, callback) {

    // Get Effective Services for departure date
    CalendarTable.getServicesEffective(db, dateTime.getDateInt(), function(services) {

        // Build Service ID String
        let serviceIds = [];
        for ( let i = 0; i < services.length; i++ ) {
            serviceIds.push(services[i].id);
        }
        let serviceIdString = "('" + serviceIds.join("', '") + "')";

        // Find a matching trip in the gtfs_stop_times table
        let select = "SELECT trip_id FROM gtfs_trips " +
            "WHERE service_id IN " + serviceIdString + " " +
            "AND trip_id IN (" +
            "SELECT trip_id FROM gtfs_stop_times WHERE stop_id='" + destinationId + "' " +
            "AND trip_id IN (" +
            "SELECT trip_id FROM gtfs_stop_times " +
            "WHERE stop_id='" + originId + "' AND departure_time_seconds=" + dateTime.getTimeSeconds() +
            "));";

        // Query the database
        db.select(select, function(results) {


            // Parse the results
            if ( results !== undefined && results.length > 0 ) {

                // Find the best match
                for ( let j = 0; j < results.length; j++ ) {
                    let row = results[j];

                    // Get StopTimes for origin and destination
                    StopTimesTable.getStopTimeByTripStop(db, row.trip_id, originId, dateTime.getDateInt(), function(originStopTime) {
                        StopTimesTable.getStopTimeByTripStop(db, row.trip_id, destinationId, dateTime.getDateInt(), function(destinationStopTime) {

                            // Check stop sequence
                            // If origin comes before destination, use that trip
                            if ( originStopTime.stopSequence < destinationStopTime.stopSequence ) {
                                getTrip(db, row.trip_id, dateTime.getDateInt(), function(trip) {
                                    if ( callback !== undefined ) {
                                        callback(trip);
                                    }
                                })
                            }

                        });
                    });

                }

            }



            // No matching trip found...
            // Check the previous day with 24+ hour time
            else {

                // Get effective services for the previous day
                CalendarTable.getServicesEffective(db, dateTime.getPreviousDateInt(), function(services) {

                    // Build Service ID String
                    let serviceIds = [];
                    for (let i = 0; i < services.length; i++) {
                        serviceIds.push(services[i].id);
                    }
                    let serviceIdString = "('" + serviceIds.join("', '") + "')";

                    // Get 24+ hour time (seconds)
                    let timeSeconds = dateTime.getTimeSeconds() + 86400;

                    // Find a matching trip in the gtfs_stop_times table
                    let select = "SELECT trip_id FROM gtfs_trips " +
                        "WHERE service_id IN " + serviceIdString + " " +
                        "AND trip_id IN (" +
                        "SELECT trip_id FROM gtfs_stop_times WHERE stop_id='" + destinationId + "' " +
                        "AND trip_id IN (" +
                        "SELECT trip_id FROM gtfs_stop_times " +
                        "WHERE stop_id='" + originId + "' AND departure_time_seconds=" + timeSeconds +
                        "));";

                    // Query the database
                    db.select(select, function (results) {



                        // Parse the results
                        if (results !== undefined && results.length > 0) {

                            // Find the best match
                            for (let j = 0; j < results.length; j++) {
                                let row = results[j];

                                // Get StopTimes for origin and destination
                                StopTimesTable.getStopTimeByTripStop(db, row.trip_id, originId, dateTime.getPreviousDateInt(), function (originStopTime) {
                                    StopTimesTable.getStopTimeByTripStop(db, row.trip_id, destinationId, dateTime.getPreviousDateInt(), function (destinationStopTime) {

                                        // Check stop sequence
                                        // If origin comes before destination, use that trip
                                        if (originStopTime.stopSequence < destinationStopTime.stopSequence) {
                                            getTrip(db, row.trip_id, dateTime.getPreviousDateInt(), function (trip) {
                                                if (callback !== undefined) {
                                                    callback(trip);
                                                }
                                            })
                                        }

                                    });
                                });
                            }

                        }


                        // STILL NO MATCHING TRAIN FOUND
                        else {
                            console.warn("NO MATCHING TRIP FOUND FOR DEPARTURE");
                            console.warn(originId + " --> " + destinationId + " ON " + dateTime.toString());

                            if ( callback !== undefined ) {
                                callback(undefined);
                            }
                        }


                    });

                });

            }


        });

    })

};





// Export Functions
module.exports = {
    getTrip: getTrip,
    getTripByDeparture: getTripByDeparture
};