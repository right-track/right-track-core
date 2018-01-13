'use strict';

/**
 * Trip Search DB Query Functions
 * @module search/query
 * @private
 */


const Agency = require('../gtfs/Agency.js');
const Route = require('../gtfs/Route.js');
const StopTime = require('../gtfs/StopTime.js');
const TripsTable = require('../query/TripsTable.js');


/**
 * Get a list of Trips that operate during the specified TripSearchDates and
 * run from the specified Stop to at least one of the provided following Stops
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {Stop} stop The reference Stop
 * @param {TripSearchDate[]} tripSearchDates List of Trip Search Dates
 * @param {String[]} nextStops List of following Stops (Stop IDs)
 * @param {function} callback Callback function
 * @param {Error} callback.err Database Query Error
 * @param {Trip[]} [callback.trips] List of matching Trips
 * @private
 */
function getTripsFromStop(db, stop, tripSearchDates, nextStops, callback) {

  // List of Trips to Return
  let rtn = [];

  // Counters
  let done = 0;
  let count = 0;

  // Parse each TripSearchDate separately
  for ( let i = 0; i < tripSearchDates.length; i++ ) {
    let tripSearchDate = tripSearchDates[i];

    // Build Service ID String
    let serviceIdString = "'" + tripSearchDate.serviceIds.join("', '") + "'";

    // Get Trip IDs
    let select = "SELECT gtfs_stop_times.trip_id " +
      "FROM gtfs_stop_times " +
      "INNER JOIN gtfs_trips ON gtfs_stop_times.trip_id=gtfs_trips.trip_id " +
      "WHERE stop_id='" + stop.id + "' AND " +
      "departure_time_seconds >= " + tripSearchDate.preSeconds + " AND departure_time_seconds <= " + tripSearchDate.postSeconds + " AND " +
      "pickup_type <> " + StopTime.PICKUP_TYPE_NONE + " AND " +
      "gtfs_trips.service_id IN (" + serviceIdString + ")";

    // Select the Trip IDs
    db.select(select, function(err, results) {

      // Database Query Error
      if ( err ) {
        return callback(
          new Error('Could not get Trip(s) from database')
        );
      }

      // No Results
      if ( results.length === 0 ) {
        return callback(null, rtn);
      }

      // Set the counter
      count = count + results.length;

      // Build the Trips
      for ( let i = 0; i < results.length; i++ ) {
        TripsTable.getTrip(db, results[i].trip_id, tripSearchDate.date, function(err, trip) {

          // Database Query Error
          if ( err ) {
            return callback(err);
          }

          // Finish Process the Trip
          _finishTrip(trip);

        });
      }


    });


  }

  /**
   * Finish processing the Trip
   * @param {Trip} trip
   * @private
   */
  function _finishTrip(trip) {
    done++;

    // Make sure trip isn't already in list
    let found = false;
    for ( let i = 0; i < rtn.length; i++ ) {
      if ( rtn[i].id === trip.id ) {
        found = true;
      }
    }

    // Process new trip
    if ( !found ) {

      // Make sure the trip stops at any of the next stops, after the current stop
      let stopFound = false;
      let add = false;
      for ( let i = 0; i < trip.stopTimes.length; i++ ) {
        let stopId = trip.stopTimes[i].stop.id;
        if ( !stopFound && stopId === stop.id ) {
          stopFound = true;
        }
        else if ( stopFound ) {
          if ( nextStops.indexOf(stopId) > -1 ) {
            add = true;
            i = trip.stopTimes.length;
          }
        }
      }

      // Add Trip
      if ( add ) {
        rtn.push(trip);
      }

    }

    // Return the Trips
    if ( done === count ) {
      return callback(null, rtn);
    }
  }

}



module.exports = {
  getTripsFromStop: getTripsFromStop
};