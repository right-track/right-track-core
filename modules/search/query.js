'use strict';

/**
 * Trip Search DB Query Functions
 * @module search/query
 * @private
 */


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
  let count = tripSearchDates.length;

  // Parse each TripSearchDate separately
  for ( let i = 0; i < tripSearchDates.length; i++ ) {
    _getTripsFromStop(db, stop, tripSearchDates[i], function(err, trips) {

      // Database Query Error
      if ( err ) {
        return callback(err);
      }

      // Check each of the Trips to add
      for ( let j = 0; j < trips.length; j++ ) {
        _addTrip(trips[j]);
      }

      // Finish the TSD
      _finish();

    });
  }


  /**
   * Add the specified Trip to the return list, if it is not
   * already present and it continues to one of the next stops
   * @param {Trip} trip Trip to add
   * @private
   */
  function _addTrip(trip) {

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

  }


  /**
   * Finish processing the Trip Search Dates
   * @private
   */
  function _finish() {
    done++;
    if ( done === count ) {
      return callback(null, rtn);
    }
  }

}


/**
 * Get the number of Trips that leave from the specified Stop during the specified time
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {Stop} stop The origin Stop
 * @param {TripSearchDate} tripSearchDates The TripSearchDate departure time window
 * @param {Function} callback Callback function(err, count)
 */
function getTripCountFromStop(db, stop, tripSearchDates, callback) { 
  TripsTable.getTripIDsByTripSearchDate(db, stop, tripSearchDates, function(err, tripIDs) {
    if ( err ) {
      return callback(err)
    }
    return callback(null, tripIDs ? tripIDs.length : 0);
  });
}


/**
 * Get the Trips within the TripSearchDate range from the specified Stop
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {Stop} stop The reference Stop
 * @param {TripSearchDate} tripSearchDate The Trip Search Date
 * @param {function} callback Callback function(err, trips)
 * @private
 */
function _getTripsFromStop(db, stop, tripSearchDate, callback) {

  // List of trips to return
  let rtn = [];

  // Set counters
  let done = 0;
  let count = 0;

  // Get the Trip IDs of matching Trips
  TripsTable.getTripIDsByTripSearchDate(db, stop, tripSearchDate, function(err, results) {

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
    count = results.length;

    // Build the Trips
    for ( let i = 0; i < results.length; i++ ) {
      TripsTable.getTrip(db, results[i], tripSearchDate.date, function(err, trip) {

        // Database Query Error
        if ( err ) {
          return callback(err);
        }

        // Add trip to list
        if ( trip ) {
          rtn.push(trip);
        }

        // Finish Process the Trip
        _finish();

      });
    }

  });


  /**
   * Finished Processing Trip
   * @private
   */
  function _finish() {
    done++;
    if ( done === count ) {
      return callback(null, rtn);
    }
  }

}



module.exports = {
  getTripsFromStop: getTripsFromStop,
  getTripCountFromStop: getTripCountFromStop
};