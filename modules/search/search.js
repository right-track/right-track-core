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

  console.log("====== STARTING SEARCH ====== ");
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

    // Get the initial Trips
    _getTripsFromStop(db, origin, destination, origin, tripSearchDates, function(err, trips) {

      // Database Query Error
      if ( err ) {
        return callback(err);
      }

      // List of Direct and Indirect Trips
      let direct = [];
      let indirect = [];

      // Sort Trips
      for ( let i = 0; i < trips.length; i++ ) {
        if ( _tripGoesTo(trips[i], origin, destination) ) {
          direct.push(trips[i]);
        }
        else {
          indirect.push(trips[i]);
        }
      }


      console.log("DIRECT TRIPS: " + direct.length);
      console.log("INDIRECT TRIPS: " + indirect.length);


      // Process Direct Trips
      for ( let i = 0; i < direct.length; i++ ) {
        let trip = direct[i];

        // Create a new Trip Search Result Segment
        let segment = new TripSearchResultSegment(trip, trip.getStopTime(origin), trip.getStopTime(destination));

        // Create new Trip Search Result
        let result = new TripSearchResult(segment);

        // Add Result to List
        RESULTS.push(result);

      }

      // Process Indirect Trips, if transfers are allowed
      if ( options.allowTransfers ) {
        // TODO...
      }





      // Print Results
      for ( let i = 0; i < RESULTS.length; i++ ) {
        let result = RESULTS[i];

        console.log(result.origin.stop.name + ": " + result.origin.departure.getTimeReadable() + " --> " + result.destination.stop.name + ": " + result.destination.arrival.getTimeReadable());
        if ( result.length > 0 ) {

        }

      }


      // Return the Results
      return callback(null, RESULTS);

    });


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
 * @param {function} callback Callback function(err, trips)
 * @private
 */
function _getTripsFromStop(db, origin, destination, stop, tripSearchDates, callback) {
  console.log("------- GETTING TRIPS -------");
  console.log("Stop: " + stop.name);
  console.log("Start: " + DateTime.create(tripSearchDates[0].preSeconds, tripSearchDates[0].date).toString());
  console.log("Start: " + DateTime.create(tripSearchDates[tripSearchDates.length-1].postSeconds, tripSearchDates[tripSearchDates.length-1].date).toString());

  // Get all possible following stops
  LineGraphTable.getNextStops(db, origin.id, destination.id, stop.id, function(err, nextStops) {
    console.log("Next Stops: " + JSON.stringify(nextStops));

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // Get Trips from Stop
    query.getTripsFromStop(db, stop, tripSearchDates, nextStops, function(err, trips) {
      console.log("Trips: " + trips.length);
      console.log("-----------------------------");

      // Database Query Error
      if ( err ) {
        return callback(err);
      }

      // Return the Trips
      return callback(null, trips);

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

  console.log("PRE DATE/TIME: " + preDateTime.toString());
  console.log("POST DATE/TIME: " + postDateTime.toString());

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





module.exports = search;