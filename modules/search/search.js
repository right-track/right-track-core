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
 * @param {DateTime} departure Requested Departure Date/Time
 * @param {Object} options Trip Search Options
 * @param {function} callback Callback Function
 * @private
 */
function search(db, origin, destination, departure, options, callback) {
  _log("====== STARTING SEARCH ======");
  _log("ORIGIN: " + origin.name);
  _log("DESTINATION: " + destination.name);
  _log("DATE/TIME: " + departure.toString());
  _log("OPTIONS: " + JSON.stringify(options, null, 2));


  // List of Results
  let RESULTS = [];


  // Get the initial Trip Search Dates
  _getTripSearchDates(db, departure, options.preDepartureHours*60, options.postDepartureHours*60, function(err, tripSearchDates) {
    _log("===== SEARCH TIME RANGE =====");
    for ( let i = 0; i < tripSearchDates.length; i++ ) {
      _log(JSON.stringify(tripSearchDates[i], null, 2));
    }

    // Database Query Error
    if ( err ) {
      return callback(err);
    }


    // GET ORIGIN TRIPS
    _getTripsFromStop(db, origin, destination, origin, tripSearchDates, [], false, function(err, originDirect, originIndirect) {

      // Database Query Error
      if ( err ) {
        return callback(err);
      }

      // GET DESTINATION TRIPS
      _getTripsFromStop(db, destination, origin, destination, tripSearchDates, [], true, function(err, destinationDirect, destinationIndirect) {

        // Database Query Error
        if ( err ) {
          return callback(err);
        }


        // SET REVERSE FLAG
        let reverse = false;
        if ( destinationDirect.length + destinationIndirect.length < originDirect.length + originIndirect.length ) {
          reverse = true;
        }



        _log("======= INITIAL TRIPS =======");
        _log("ORIGIN DIRECT TRIPS: " + originDirect.length);
        _log("ORIGIN INDIRECT TRIPS: " + originIndirect.length);
        _log("DESTINATION DIRECT TRIPS: " + destinationDirect.length);
        _log("DESTINATION INDIRECT TRIPS: " + destinationIndirect.length);
        _log("REVERSE SEARCH: " + reverse);




        // Set direct and indirect trips based on reverse flag
        let direct = reverse ? destinationDirect : originDirect;
        let indirect = reverse ? destinationIndirect : originIndirect;


        // Process Direct Trips
        _log("======== DIRECT TRIPS =======");
        for ( let i = 0; i < direct.length; i++ ) {
          let trip = direct[i];

          _log("   Trip ID: " + trip.id);

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
          let start = reverse ? destination : origin;
          let end = reverse ? origin : destination;
          _processTrips(db, options, start, end, start, indirect, [], reverse, function(err, results) {
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

  // Clean up departures
  results = _cleanDepartures(results);

  // Clean up arrivals
  results = _cleanArrivals(results);

  // Sort By Departure Time
  results.sort(TripSearchResult.sortByDeparture);

  // Return results
  return results;


  /**
   * Pick best Trip with equal departures
   * @param results
   * @returns {Array}
   * @private
   */
  function _cleanDepartures(results) {
    // List of Departures to Keep
    let departures = [];

    // Get unique departures
    let departureTimes = [];
    for ( let i = 0; i < results.length; i++ ) {
      if ( departureTimes.indexOf(results[i].origin.departure.toTimestamp()) === -1 ) {
        departureTimes.push(results[i].origin.departure.toTimestamp());
      }
    }

    // Pick best Trip for each departure
    for ( let i = 0; i < departureTimes.length; i++ ) {
      let departureTime = departureTimes[i];
      let departure = undefined;

      // Get Trips with departure time
      for ( let j = 0; j < results.length; j++ ) {
        let result = results[j];
        if ( result.origin.departure.toTimestamp() === departureTime ) {
          if ( departure === undefined )  {
            departure = result;
          }
          else if ( result.destination.arrival.toTimestamp() < departure.destination.arrival.toTimestamp() ) {
            departure = result;
          }
          else if ( result.destination.arrival.toTimestamp() === departure.destination.arrival.toTimestamp() && result.length < departure.length ) {
            departure = result;
          }
        }
      }

      // Add departure to list
      departures.push(departure);
    }

    // Return departures
    return departures;
  }


  /**
   * Pick best Trip with equal arrivals
   * @param results
   * @returns {Array}
   * @private
   */
  function _cleanArrivals(results) {
    // List of Arrivals to Keep
    let arrivals = [];

    // Get unique arrivals
    let arrivalTimes = [];
    for ( let i = 0; i < results.length; i++ ) {
      if ( arrivalTimes.indexOf(results[i].destination.arrival.toTimestamp()) === -1 ) {
        arrivalTimes.push(results[i].destination.arrival.toTimestamp());
      }
    }

    // Pick best Trip for each arrival
    for ( let i = 0; i < arrivalTimes.length; i++ ) {
      let arrivalTime = arrivalTimes[i];
      let arrival = undefined;

      // Get Trips with arrival time
      for ( let j = 0; j < results.length; j++ ) {
        let result = results[j];
        if ( result.destination.arrival.toTimestamp() === arrivalTime ) {
          if ( arrival === undefined )  {
            arrival = result;
          }
          else if ( result.origin.departure.toTimestamp() > arrival.origin.departure.toTimestamp() ) {
            arrival = result;
          }
          else if ( result.origin.departure.toTimestamp() === arrival.origin.departure.toTimestamp() && result.length < arrival.length ) {
            arrival = result;
          }
        }
      }

      // Add arrival to list
      arrivals.push(arrival);

    }

    // Return arrivals
    return arrivals;
  }

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
 * @param {boolean} reverse Reverse Search flag
 * @param {function} callback Callback function(err, results)
 * @private
 */
function _processTrips(db, options, origin, destination, enter, trips, segments, reverse, callback) {

  // Display function logs
  _info();

  // Results to Return
  let RESULTS = [];


  // Set up counters
  let done = 0;
  let count = trips.length;


  // Finish when there are no trips to process
  if ( trips.length === 0 ) {
    _finish();
  }

  // Process each of the Trips
  for ( let i = 0; i < trips.length; i++ ) {
    _processTrip(db, options, origin, destination, enter, trips[i], segments, reverse, function(err, results) {

      // Database Query Error
      if ( err ) {
        return callback(err);
      }

      // Add Results to final list
      RESULTS = RESULTS.concat(results);

      // Finish
      _finish();

    })
  }


  /**
   * Finished Processing the Trips
   * @private
   */
  function _finish() {
    done++;
    if ( count === 0 || done === count ) {
      return callback(null, RESULTS);
    }
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
 * @param {boolean} reverse Reverse Search flag
 * @param {function} callback Callback function(err, results)
 * @private
 */
function _processTrip(db, options, origin, destination, enter, trip, segments, reverse, callback) {

  // Get Transfer Stops for this Trip
  _getTransferStops(db, origin, destination, enter, trip, function(err, transfers) {

    // Print Log Info
    _info(transfers);

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // Process the Transfers
    _processStops(db, options, origin, destination, enter, transfers, trip, segments, reverse, function(err, results) {

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
 * @param {boolean} reverse Reverse Search flag
 * @param {function} callback Callback function(err, results)
 * @private
 */
function _processStops(db, options, origin, destination, enter, transfers, trip, segments, reverse, callback) {

  // Results to Return
  let RESULTS = [];

  // Set up counters
  let done = 0;
  let count = transfers.length;

  // No transfers, finish
  if ( transfers.length === 0 ) {
    _finish();
  }

  // Process each Stop
  for ( let i = 0; i < transfers.length; i++ ) {
    _processStop(db, options, origin, destination, enter, transfers[i], trip, segments, reverse, function(err, results) {

      // Database Query Error
      if ( err ) {
        return callback(err);
      }

      // Add results to final list
      RESULTS = RESULTS.concat(results);

      // Finish
      _finish();

    });
  }


  /**
   * Finished processing the Stops
   * @private
   */
  function _finish() {
    done++;
    if ( count === 0 || done === count ) {
      return callback(null, RESULTS);
    }
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
 * @param {boolean} reverse Reverse Search flag
 * @param {function} callback Callback function(err, results)
 * @private
 */
function _processStop(db, options, origin, destination, enter, transfer, trip, segments, reverse, callback) {

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
    _getTripsFromStop(db, origin, destination, transfer, tripSearchDates, excludeTrips, reverse, function(err, direct, indirect) {

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

      // Process Indirect Trips
      if ( direct.length === 0 && indirect.length > 0 && options.allowTransfers && segments.length < options.maxTransfers ) {

        // Process the Indirect Trips
        _processTrips(db, options, origin, destination, transfer, indirect, segments, reverse, function(err, results) {

          // Database Query Error
          if ( err ) {
            return callback(err);
          }

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

    // Return only the top 3 transfer Stops
    if ( rtn.length > 3 ) {
      rtn = [rtn[0], rtn[1], rtn[2]];
    }

    return callback(null, rtn);

  });

}



/**
 * Get a List of Trips from the reference Stop that operate during the
 * TripSearchDates and along the Line Graph paths between the origin
 * and destination Stops
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {Stop} start Trip Start Stop
 * @param {Stop} end Trip End Stop
 * @param {Stop} stop Reference Stop
 * @param {TripSearchDate[]} tripSearchDates Trip Search Dates
 * @param {String[]} excludeTrips List of Trip IDs to exclude
 * @param {boolean} reverse Reverse Search flag
 * @param {function} callback Callback function(err, direct, indirect)
 * @private
 */
function _getTripsFromStop(db, start, end, stop, tripSearchDates, excludeTrips, reverse, callback) {

  console.log("Getting Trips from: " + start.name + " --> " + end.name + " (@" + stop.name + ") reverse: " + reverse);

  // Get all possible following stops
  LineGraphTable.getNextStops(db, start.id, end.id, stop.id, function(err, nextStops) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // Get Trips from Stop
    query.getTripsFromStop(db, stop, tripSearchDates, nextStops, reverse, function(err, trips) {

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
          if ( _tripGoesTo(trips[i], reverse ? end : start, reverse ? start : end, reverse) ) {
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
 * @param {Stop} start Start Stop
 * @param {Stop} end End Stop
 * @param {boolean} reverse Reverse Search flag
 * @returns {boolean}
 * @private
 */
function _tripGoesTo(trip, start, end, reverse) {
  console.log("TRIP: " + trip.id + " goes to " + start.name + " --> " + end.name + "(" + reverse + ")");

  let startFound = false;
  if ( !reverse ) {
    for ( let i = 0; i < trip.stopTimes.length; i++ ) {
      if ( !startFound && trip.stopTimes[i].stop.id === start.id ) {
        startFound = true;
      }
      else if ( startFound ) {
        if ( trip.stopTimes[i].stop.id === end.id ) {
          return true;
        }
      }
    }
    return false;
  }
  else {
    for ( let i = trip.stopTimes.length-1; i >= 0; i-- ) {
      if ( !startFound && trip.stopTimes[i].stop.id === start.id ) {
        startFound = true;
      }
      else if ( startFound ) {
        if ( trip.stopTimes[i].stop.id === end.id ) {
          return true;
        }
      }
    }
    return false;
  }
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