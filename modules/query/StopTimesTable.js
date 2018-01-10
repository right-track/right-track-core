'use strict';

/**
 * ### StopTime Query Functions
 * These functions query the `gtfs_stop_times` table in the Right Track Database.
 * @module query/stoptimes
 */

const cache = require('memory-cache');
const Stop = require('../gtfs/Stop.js');
const StopTime = require('../gtfs/StopTime.js');



// ==== QUERY FUNCTIONS ==== //


/**
 * Get the list of StopTimes for the specified Trip
 * from the passed database (sorted by stop sequence)
 *
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {string} tripId Trip ID
 * @param {int} date The date (yyyymmdd) the trip operates on
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {StopTime[]} [callback.stoptimes] The selected StopTimes
 */
function getStopTimesByTrip(db, tripId, date, callback) {

  // Check Cache for StopTimes
  let cacheKey = db.id + "-" + tripId + "-" + date;
  let cache = cache_stoptimesByTrip.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

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
  db.select(select, function(err, results) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // List of StopTimes to return
    let rtn = [];

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
        row.drop_off_type,
        date
      );

      // Add stoptime to list
      rtn.push(stopTime);
    }

    // Add StopTimes to cache
    cache_stoptimesByTrip.put(cacheKey, rtn);

    // Return the StopTimes with the callback
    return callback(null, rtn);

  });

}


/**
 * Get the StopTime for the specified Trip and the
 * specified Stop from the passed database
 *
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {string} tripId Trip ID
 * @param {string} stopId Stop ID
 * @param {int} date The date (yyyymmdd) the the Trip operates on
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {StopTime} [callback.stoptime] The selected StopTime
 */
function getStopTimeByTripStop(db, tripId, stopId, date, callback) {

  // Cache Cache for StopTimes
  let cacheKey = db.id + "-" + tripId + "-" + stopId + "-" + date;
  let cache = cache_stoptimesByTripStop.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

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
  db.get(select, function(err, result) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // Stop Not Found
    if ( result === undefined ) {
      return callback(null, undefined);
    }

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
      result.drop_off_type,
      date
    );

    // Add StopTimes to Cache
    cache_stoptimesByTripStop.put(cacheKey, stopTime);

    // Return the StopTimes with the callback
    return callback(null, stopTime);

  });

}




// ==== SETUP CACHES ==== //
let cache_stoptimesByTrip = new cache.Cache();
let cache_stoptimesByTripStop = new cache.Cache();

/**
 * Clear the StopTimesTable caches
 * @private
 */
function clearCache() {
  cache_stoptimesByTrip.clear();
  cache_stoptimesByTripStop.clear();
}


// Export Functions
module.exports = {
  getStopTimesByTrip: getStopTimesByTrip,
  getStopTimeByTripStop: getStopTimeByTripStop,
  clearCache: clearCache
};