'use strict';

/**
 * Trip Search helper functions
 * @module search/search
 * @private
 */


const query = require('./query.js');
const TripSearchDate = require('./TripSearchDate.js');
const TripSearchResult = require('./TripSearchResult.js');
const TripSearchResultSegment = require('./TripSearchResultSegment.js');
const DateTime = require('../utils/DateTime.js');
const CalendarTable = require('../query/CalendarTable.js');
const LineGraphTable = require('../query/LineGraphTable.js');

/**
 * Perform a Trip Search between the origin and destination Stops
 * with the provided parameters and options
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {Stop} origin Origin Stop
 * @param {Stop} destination Destination Stop
 * @param {DateTime} datetime Requested Departure Date/Time
 * @param {Object} options Trip Search Options
 * @param {function} callback Callback Function
 * @private
 */
function search(db, origin, destination, datetime, options, callback) {

  console.log("====== STARTING SEARCH ======");
  console.log("ORIGIN: " + origin.name);
  console.log("DESTINATION: " + destination.name);
  console.log("DATE/TIME: " + datetime.toString());
  console.log("OPTIONS: " + JSON.stringify(options));


  // List of Results
  let RESULTS = [];


  // Get the initial Trip Search Dates
  _getTripSearchDates(db, datetime, options.preDateHours*60, options.postDateHours*60, function(err, tripSearchDates) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }


    // Get the Initial Trips
    _getTripsFromStop(db, origin, destination, origin, tripSearchDates, function(err, direct, indirect) {

      console.log("======= INITIAL SEARCH ======");
      console.log("DIRECT TRIPS: " + direct.length);
      console.log("INDIRECT TRIPS: " + indirect.length);


      // Database Query Error
      if ( err ) {
        return callback(err);
      }


      // Process Direct Trips
      for ( let i = 0; i < direct.length; i++ ) {
        let trip = direct[i];

        // Create a new Trip Search Result Segment
        let segment = new TripSearchResultSegment(trip, origin, destination);

        // Create new Trip Search Result
        let result = new TripSearchResult(segment);

        // Add Result to List
        RESULTS.push(result);

      }


      // Process Indirect Trips, if transfers are allowed
      if ( indirect.length > 0 && options.allowTransfers ) {
        console.log("====== TRANSFER SEARCH ======");

        // Process the Indirect Trips
        _processTrips(db, options, origin, destination, origin, indirect, [], function(err, results) {

          // Add results to final list
          RESULTS = RESULTS.concat(results);

          // Finish
          _finish();

        });

      }


      // No transfers required or disabled, finish
      else {
        _finish();
      }


    });


  });


  /**
   * Finished processing all trips, get Results ready to return
   * @private
   */
  function _finish() {
    console.log("=============================");

    // TODO: clean results

    // Print Results
    for ( let i = 0; i < RESULTS.length; i++ ) {
      let result = RESULTS[i];

      console.log(result.origin.stop.name + ": " + result.origin.departure.getTimeReadable() + " --> " + result.destination.stop.name + ": " + result.destination.arrival.getTimeReadable());
      if ( result.length > 1 ) {
        _printSegments(result.segments);
      }

    }

    // Return the Results
    return callback(null, RESULTS);

  }


}


function _processTrips(db, options, origin, destination, stop, trips, segments, callback) {
  console.log("Processing " + trips.length + " Trips...");

  // Results to Return
  let RESULTS = [];

  // Set Counters
  let done = 0;
  let count = trips.length;

  // Finish when there are no trips to process
  if ( trips.length === 0 ) {
    _finish();
  }

  // Process each Trip individually
  for ( let i = 0; i < trips.length; i++ ) {
    _processTrip(db, options, origin, destination, origin, trips[i], [], function(err, results) {

      // Database Query Error
      if ( err ) {
        return callback(err);
      }

      _finish(results);

    });
  }


  /**
   * Finished processing a Trip
   * @private
   */
  function _finish(results=[]) {
    done ++;

    // Add results to final list
    RESULTS = RESULTS.concat(results);

    if ( done === count ) {
      return callback(null, RESULTS);
    }
  }

}


function _processTrip(db, options, origin, destination, enter, trip, segments, callback) {
  console.log("...Trip " + trip.id);
  console.log("   Stop: " + enter.name);
  console.log("   Segments: " + segments.length);

  // Get Transfer Stops for this Trip
  _getTransferStops(db, origin, destination, enter, trip, function(err, transfers) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // Process the Transfers
    _processTransfers(db, options, origin, destination, enter, transfers, trip, segments, function(err, results) {

      // Database Query Error
      if ( err ) {
        return callback(err);
      }

      // Return the results
      return callback(null, results);

    });

  });

}


function _processTransfers(db, options, origin, destination, enter, transfers, trip, segments, callback) {
  console.log("   Transfer Stops: " + transfers.length);

  // Results to Return
  let RESULTS = [];

  // Set counters
  let done = 0;
  let count = transfers.length;

  // Parse Each of the Transfer Stops
  for ( let i = 0; i < transfers.length; i++ ) {
    _processTransfer(db, options, origin, destination, enter, transfers[i], trip, segments, function(err, results) {

      // Database Query Error
      if ( err ) {
        return callback(err);
      }

      // Process Results
      _finish(results);

    });
  }


  function _finish(results) {
    done++;

    // Add results to final list
    RESULTS = RESULTS.concat(results);

    if ( done === count ) {
      return callback(null, RESULTS);
    }
  }

}


function _processTransfer(db, options, origin, destination, enter, transfer, trip, segments, callback) {
  console.log("   ...Transfer @ " + transfer.name + " @ " + trip.getStopTime(transfer).arrival.getTimeReadable());

  // Clone Segments
  segments = segments.slice();

  // Create the First Segment
  let firstSegment = new TripSearchResultSegment(trip, enter, transfer);
  segments.push(firstSegment);

  // Results to Return
  let RESULTS = [];

  // Set Counters
  let done = 0;
  let count = 0;


  // Set TripSearchDates
  let arrival = trip.getStopTime(transfer).arrival;
  _getTripSearchDates(db, arrival, -1*options.minLayoverMins, options.maxLayoverMins, function(err, tripSearchDates) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // Get Trips From Transfer
    _getTripsFromStop(db, origin, destination, transfer, tripSearchDates, function(err, direct, indirect) {
      console.log("      ...Trips From " + transfer.name + " From Trip " + trip.id + ":");
      console.log("         Direct: " + direct.length);
      console.log("         Indirect: " + indirect.length);
      console.log("         Segments: " + segments.length);

      // Database Query Error
      if ( err ) {
        return callback(err);
      }


      // Process Direct Trips
      for ( let i = 0; i < direct.length; i++ ) {
        let trip = direct[i];

        // Clone the segments
        let newSegments = segments.slice();

        // Create a new Trip Search Result Segment
        let secondSegment = new TripSearchResultSegment(trip, transfer, destination);
        newSegments.push(secondSegment);

        // Create a Trip Search Result
        let result = new TripSearchResult(newSegments);

        // Add result to list
        RESULTS.push(result);

      }


      // Process Indirect Trips
      if ( indirect.length > 0 && options.allowTransfers && segments.length < options.maxTransfers ) {
        console.log("====== CONTINUE TRANSFER SEARCH ======");

        // Set counter
        count = count + indirect.length;

        // Process the Indirect Trips
        _processTrips(db, options, origin, destination, transfer, indirect, segments, function(err, results) {

          // Add results to final list
          RESULTS = RESULTS.concat(results);

          // Finish
          _finish();

        });

      }


      // No transfers required or disabled, finish
      else {
        return callback(null, RESULTS);
      }

    });

  });



  function _finish() {
    done++;
    if ( done === count ) {
      return callback(null, RESULTS);
    }
  }

}




/**
 * Get a list of Stop IDs, sorted by transfer weight, that can be
 * used as a Transfer Stop for this Trip
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {Stop} origin Origin Stop
 * @param {Stop} destination Destination Stop
 * @param {Stop} stop Reference Stop
 * @param {Trip} trip Trip to transfer from
 * @param {function} callback Callback function(err, stops)
 * @private
 */
function _getTransferStops(db, origin, destination, stop, trip, callback) {

  // List of Transfer Stops
  let rtn = [];

  // Get Next Stops from this Stop
  LineGraphTable.getNextStops(db, origin.id, destination.id, stop.id, function(err, nextStops) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // Get Remaining Stops on Trip
    let remainingStops = [];
    let stopFound = false;
    for ( let i = 0; i < trip.stopTimes.length; i++ ) {
      if ( !stopFound && trip.stopTimes[i].stop.id === stop.id ) {
        stopFound = true;
      }
      else if ( stopFound ) {
        remainingStops.push(trip.stopTimes[i].stop.id);
      }
    }

    // Get Next Stops that are remaining on this Trip
    for ( let i = 0; i < nextStops.length; i++ ) {
      if ( remainingStops.indexOf(nextStops[i]) > -1 ) {
        rtn.push(
          trip.getStopTime(nextStops[i]).stop
        );
      }
    }

    return callback(null, rtn);

  });

}



/**
 * Get a List of Trips from the reference Stop that operate during the
 * TripSearchDates and along the Line Graph paths between the origin
 * and destination Stops
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {Stop} origin Trip Origin Stop
 * @param {Stop} destination Trip Destination Stop
 * @param {Stop} stop Reference Stop
 * @param {TripSearchDate[]} tripSearchDates Trip Search Dates
 * @param {function} callback Callback function(err, direct, indirect)
 * @private
 */
function _getTripsFromStop(db, origin, destination, stop, tripSearchDates, callback) {

  // Get all possible following stops
  LineGraphTable.getNextStops(db, origin.id, destination.id, stop.id, function(err, nextStops) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // Get Trips from Stop
    query.getTripsFromStop(db, stop, tripSearchDates, nextStops, function(err, trips) {

      // Database Query Error
      if ( err ) {
        return callback(err);
      }

      // List of Direct and Indirect Trips
      let direct = [];
      let indirect = [];

      // Sort Trips
      for ( let i = 0; i < trips.length; i++ ) {
        if ( _tripGoesTo(trips[i], stop, destination) ) {
          direct.push(trips[i]);
        }
        else {
          indirect.push(trips[i]);
        }
      }

      // Return the Trips
      return callback(null, direct, indirect);

    });

  });

}



/**
 * Get the Trip Search Dates for the specified search range
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {DateTime} datetime The Date/Time of the search starting point
 * @param {int} preMins The number of mins before the datetime to include
 * @param {int} postMins The number of mins after the datetime to include
 * @param {function} callback Callback function(err, tripSearchDates)
 * @private
 */
function _getTripSearchDates(db, datetime, preMins, postMins, callback) {

  // Get pre and post dates
  let preDateTime = datetime.clone().deltaMins(-1*preMins);
  let postDateTime = datetime.clone().deltaMins(postMins);

  // List of TripSearchDates to return
  let rtn = [];

  // Counters
  let done = 0;
  let count = 0;


  // ==== PRE AND POST DATES ARE SAME DAY ==== //
  if ( preDateTime.getDateInt() === postDateTime.getDateInt() ) {
    count = 1;

    // Get Effective Services
    CalendarTable.getServicesEffective(db, datetime.getDateInt(), function(err, services) {

      // Database Query Error
      if ( err ) {
        return callback(err);
      }

      // Create new TripSearchDate
      let tsd = new TripSearchDate(
        preDateTime.getDateInt(),
        preDateTime.getTimeSeconds(),
        postDateTime.getTimeSeconds(),
        services
      );

      // Add to List
      rtn.push(tsd);

      // Finish
      _finish();

    });

  }


  // ==== PRE AND POST DATES ARE DIFFERENT DAYS ==== //
  else {
    count = 2;

    // Get Effective Services for Prev Day
    CalendarTable.getServicesEffective(db, preDateTime.getDateInt(), function(err, services) {

      // Database Query Error
      if ( err ) {
        return callback(err);
      }

      // Create new TripSearchDate
      let tsd = new TripSearchDate(
        preDateTime.getDateInt(),
        preDateTime.getTimeSeconds(),
        postDateTime.getTimeSeconds() + 86400,
        services
      );

      // Add to List
      rtn.push(tsd);

      // Finish
      _finish();

    });


    // Get Effective Services for Post Day
    CalendarTable.getServicesEffective(db, postDateTime.getDateInt(), function(err, services) {

      // Database Query Error
      if ( err ) {
        return callback(err);
      }

      // Create new TripSearchDate
      let tsd = new TripSearchDate(
        postDateTime.getDateInt(),
        0,
        postDateTime.getTimeSeconds(),
        services
      );

      // Add to List
      rtn.push(tsd);

      // Finish
      _finish();

    });

  }


  // Finish processing a Trip Search Date
  function _finish() {
    done++;
    if ( done === count ) {
      return callback(null, rtn);
    }
  }

}


/**
 * Check if the Trip goes from Origin --> Destination
 * @param {Trip} trip The Trip to check
 * @param {Stop} origin Origin Stop
 * @param {Stop} destination Destination Stop
 * @returns {boolean}
 * @private
 */
function _tripGoesTo(trip, origin, destination) {
  let originFound = false;
  for ( let i = 0; i < trip.stopTimes.length; i++ ) {
    if ( !originFound && trip.stopTimes[i].stop.id === origin.id ) {
      originFound = true;
    }
    else if ( originFound ) {
      if ( trip.stopTimes[i].stop.id === destination.id ) {
        return true;
      }
    }
  }
  return false;
}


function _printSegments(segments) {
  for ( let i = 0; i < segments.length; i++ ) {
    let segment = segments[i];
    console.log("  " + segment.enter.stop.name + " @ " + segment.enter.departure.getTimeReadable() + " --> " + segment.exit.stop.name + " @ " + segment.exit.arrival.getTimeReadable());
  }
}




module.exports = search;