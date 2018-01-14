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


const LOG = true;



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

  _log("====== STARTING SEARCH ======");
  _log("ORIGIN: " + origin.name);
  _log("DESTINATION: " + destination.name);
  _log("DATE/TIME: " + datetime.toString());
  _log("OPTIONS: " + JSON.stringify(options, null, 2));


  // List of Results
  let RESULTS = [];


  // Get the initial Trip Search Dates
  _getTripSearchDates(db, datetime, options.preDateHours*60, options.postDateHours*60, function(err, tripSearchDates) {
    _log("===== SEARCH TIME RANGE =====");
    for ( let i = 0; i < tripSearchDates.length; i++ ) {
      _log(JSON.stringify(tripSearchDates[i], null, 2));
    }

    // Database Query Error
    if ( err ) {
      return callback(err);
    }


    // Get the Initial Trips
    _getTripsFromStop(db, origin, destination, origin, tripSearchDates, [], function(err, direct, indirect) {
      _log("======= INITIAL TRIPS =======");
      _log("DIRECT TRIPS: " + direct.length);
      _log("INDIRECT TRIPS: " + indirect.length);

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
        _log("====== TRANSFER SEARCH ======");

        // Process the Indirect Trips
        _processTrips(db, options, origin, destination, origin, indirect, [], function(err, results) {
          _log("=== TRANSFER SEARCH RETURN ==");

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
    _log("=============================");

    // Clean the Results
    RESULTS = _cleanResults(RESULTS);

    // Return the Results
    return callback(null, RESULTS);

  }


}


/**
 * Clean the list of Trip Search Results
 * - sort by departure date/time
 * - pick best trip that leaves/arrives at same time
 * - remove excessively long trips
 * @param {TripSearchResult[]} results
 * @returns {TripSearchResult[]} clean results
 * @private
 */
function _cleanResults(results) {

  // Sort by Departure Times
  results.sort(TripSearchResult.sortByDeparture);

  return results;

}




/**
 * Process a group of Trips from the reference Stop
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {Object} options Trip Search Options
 * @param {Stop} origin Trip Search Origin Stop
 * @param {Stop} destination Trip Search Destination Stop
 * @param {Stop} enter Reference/Entry Stop
 * @param {Trip[]} trips List of Trips to process
 * @param {TripSearchResultSegment[]} segments Previously added Trip Search Result Segments
 * @param {function} callback Callback function(err, results)
 * @private
 */
function _processTrips(db, options, origin, destination, enter, trips, segments, callback) {

  // Display function logs
  _info();

  // Results to Return
  let RESULTS = [];

  // Finish when there are no trips to process
  if ( trips.length === 0 ) {
    _finish();
  }

  // Start Processing the Trips
  else {
    _start();
  }


  /**
   * Start Processing a Trip
   * @param index=0 Trip Index to Process
   * @private
   */
  function _start(index=0) {
    if ( index < trips.length ) {
      //console.warn("PROCESSING TRIP " + parseInt(index+1) + " / " + trips.length);

      _processTrip(db, options, origin, destination, enter, trips[index], segments, function(err, results) {

        // Database Query Error
        if ( err ) {
          return callback(err);
        }

        // Add results to final list
        RESULTS = RESULTS.concat(results);

        // Next step
        index = index+1;
        _start(index);

      });
    }
    else {
      _finish();
    }
  }

  /**
   * Finished Processing the Trips
   * @private
   */
  function _finish() {
    return callback(null, RESULTS);
  }

  /**
   * Display function logging info
   * @private
   */
  function _info() {
    if ( LOG ) {
      let p = "";
      for ( let i = 0; i < segments.length * 2; i++ ) {
        p = p + " ";
      }

      let tripIds = [];
      for ( let i = 0; i < trips.length; i++ ) {
        tripIds.push(trips[i].id);
      }
      _log(p + "Trips From " + enter.name + ": " + trips.length + " ('" + tripIds.join("', '") + "')");

      _log(p + "   Segments: " + segments.length);
      _printSegments(segments, p + "   ");
    }
  }

}


/**
 * Process a Trip from the reference/entry Stop
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {Object} options Trip Search Options
 * @param {Stop} origin Trip Search Origin Stop
 * @param {Stop} destination Trip Search Destination Stop
 * @param {Stop} enter Trip Entry Stop
 * @param {Trip} trip Trip to process
 * @param {TripSearchResultSegment[]} segments List of previously added Trip Search Result Segments
 * @param {function} callback Callback function(err, results)
 * @private
 */
function _processTrip(db, options, origin, destination, enter, trip, segments, callback) {

  // Get Transfer Stops for this Trip
  _getTransferStops(db, origin, destination, enter, trip, function(err, transfers) {

    // Print Log Info
    _info(transfers);

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // Process the Transfers
    _processStops(db, options, origin, destination, enter, transfers, trip, segments, function(err, results) {

      // Database Query Error
      if ( err ) {
        return callback(err);
      }

      // Return the results
      return callback(null, results);

    });

  });


  /**
   * Display logging info
   * @private
   */
  function _info(stops) {
    if ( LOG ) {
      let p = "";
      for ( let i = 0; i < segments.length * 2; i++ ) {
        p = p + " ";
      }

      _log(p + "...Trip " + trip.id);
      _log(p + "   Stop: " + enter.name + " @ " + trip.getStopTime(enter).departure.getTimeReadable());
      _log(p + "   Segments: " + segments.length);
      _printSegments(segments, p + "   ");

      let stopNames = [];
      for ( let i = 0; i < stops.length; i++ ) {
        stopNames.push(stops[i].name);
      }
      _log(p + "   Transfer Stops: " + stops.length + " (" + stopNames.join(', ') + ")");
    }
  }

}


/**
 * Process a group of Stops for possible transfers along a Trip from
 * the reference/entry Stop
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {Object} options Trip Search Options
 * @param {Stop} origin Trip Search Origin Stop
 * @param {Stop} destination Trip Search Destination Stop
 * @param {Stop} enter Trip Reference/Entry Stop
 * @param {Stop[]} transfers List of possible Transfer/Exit Stops
 * @param {Trip} trip Trip being processed
 * @param {TripSearchResultSegment[]} segments List of previously added Trip Search Result Segments
 * @param {function} callback Callback function(err, results)
 * @private
 */
function _processStops(db, options, origin, destination, enter, transfers, trip, segments, callback) {

  // Results to Return
  let RESULTS = [];

  // No transfers, finish
  if ( transfers.length === 0 ) {
    _finish();
  }

  // Start processing the Stops
  else {
    _start();
  }


  /**
   * Start processing the Stop referenced by the index
   * @param index=0 Stop Index
   * @private
   */
  function _start(index=0) {
    if ( index < transfers.length ) {
      //console.warn("PROCESSING STOP " + parseInt(index+1) + " / " + transfers.length);

      _processStop(db, options, origin, destination, enter, transfers[index], trip, segments, function(err, results) {

        // Database Query Error
        if ( err ) {
          return callback(err);
        }

        // Add results to final list
        RESULTS = RESULTS.concat(results);

        // Start next Stop
        index = index + 1;
        _start(index);

      })
    }
    else {
      _finish();
    }
  }


  /**
   * Finished processing the Stops
   * @private
   */
  function _finish() {
    return callback(null, RESULTS);
  }


}


/**
 * Process a Stop as a possible Transfer Stop from the specified Trip
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {Object} options Trip Search Options
 * @param {Stop} origin Trip Search Origin Stop
 * @param {Stop} destination Trip Search Destination Stop
 * @param {Stop} enter Trip Entry Stop
 * @param {Stop} transfer Trip Transfer/Exit Stop
 * @param {Trip} trip Trip being processed
 * @param {TripSearchResultSegment[]} segments List of previously added Trip Search Result Segments
 * @param {function} callback Callback function(err, results)
 * @private
 */
function _processStop(db, options, origin, destination, enter, transfer, trip, segments, callback) {

  // Add first segment to list
  let firstSegment = new TripSearchResultSegment(trip, enter, transfer);
  segments = segments.slice();
  segments.push(firstSegment);


  // Results to Return
  let RESULTS = [];


  // Set TripSearchDates
  let arrival = trip.getStopTime(transfer).arrival;
  _getTripSearchDates(db, arrival, -1*options.minLayoverMins, options.maxLayoverMins, function(err, tripSearchDates) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // Exclude Trips already in the segments
    let excludeTrips = [];
    for ( let i = 0; i < segments.length; i++ ) {
      excludeTrips.push(segments[i].trip.id);
    }

    // Get Trips From Transfer
    _getTripsFromStop(db, origin, destination, transfer, tripSearchDates, excludeTrips, function(err, direct, indirect) {

      // Print Stop Info
      _info(direct, indirect);

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

      // TODO: Only process indirect trips if there are no direct trips?
      // Process Indirect Trips
      if ( indirect.length > 0 && options.allowTransfers && segments.length < options.maxTransfers ) {

        // Process the Indirect Trips
        console.log("STARTING PROCESS TRIPS FROM TRANSFER LOOP");
        _processTrips(db, options, origin, destination, transfer, indirect, segments, function(err, results) {
          console.log("RETURNING PROCESS TRIPS FROM TRANSFER LOOP");

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


  function _finish() {
    return callback(null, RESULTS);
  }


  function _info(direct, indirect) {
    if ( LOG ) {
      let p = "";
      for ( let i = 0; i < segments.length * 3; i++ ) {
        p = p + " ";
      }

      _log(p + "...Transfer @ " + transfer.name + " @ " + trip.getStopTime(transfer).arrival.getTimeReadable());
      _log(p + "   ...Trips From " + transfer.name + " After Trip " + trip.id + ":");
      _log(p + "      Direct: " + direct.length);
      _log(p + "      Indirect: " + indirect.length);
      _log(p + "   ...Segments: " + segments.length);
      _printSegments(segments, p + "      ");
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
 * @param {String[]} excludeTrips List of Trip IDs to exclude
 * @param {function} callback Callback function(err, direct, indirect)
 * @private
 */
function _getTripsFromStop(db, origin, destination, stop, tripSearchDates, excludeTrips, callback) {

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
        if ( excludeTrips.indexOf(trips[i].id) === -1 ) {
          if ( _tripGoesTo(trips[i], stop, destination) ) {
            direct.push(trips[i]);
          }
          else {
            indirect.push(trips[i]);
          }
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






function _printSegments(segments, padding="  ") {
  if ( LOG ) {
    for ( let i = 0; i < segments.length; i++ ) {
      let segment = segments[i];
      _log(padding + segment.enter.stop.name + " @ " + segment.enter.departure.getTimeReadable() + " --> " + segment.exit.stop.name + " @ " + segment.exit.arrival.getTimeReadable() + " (" + segment.trip.id + ")");
    }
  }
}


function _log(text) {
  if ( LOG ) {
    console.log(text);
  }
}




module.exports = search;