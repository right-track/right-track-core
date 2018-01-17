'use strict';

/**
 * ### Trip Query Functions
 * These functions query the `gtfs_trips` table in the Right Track Database.
 * @module query/trips
 */

const cache = require('memory-cache');
const Agency = require('../gtfs/Agency.js');
const Route = require('../gtfs/Route.js');
const Stop = require('../gtfs/Stop.js');
const StopTime = require('../gtfs/StopTime.js');
const Trip = require('../gtfs/Trip.js');
const DateTime = require('../utils/DateTime.js');
const CalendarTable = require('./CalendarTable.js');
const StopTimesTable = require('./StopTimesTable.js');


// ==== QUERY FUNCTIONS ==== //


/**
 * Get the Trip (with Route, Service and StopTimes) specified by
 * the Trip ID from the passed database
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {string} id Trip ID
 * @param {int} date The date (yyyymmdd) that the Trip operates on
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Trip} [callback.trip] The selected Trip
 */
let getTrip = function(db, id, date, callback) {

  // Check cache for trip
  let cacheKey = db.id + "-" + id + "-" + date;
  let cache = cache_tripsById.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

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
  db.select(select, function(err, results) {

    // Database Query Error
    if ( err ) {
      return callback(
        new Error('Could not get Trip from database')
      );
    }

    // No Trip Found
    if ( results.length === 0 ) {
      return callback(null, undefined);
    }

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
    CalendarTable.getService(db, row.service_id, function(err, service) {

      // Database Query Error
      if ( err ) {
        return callback(err);
      }

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

      // Parse null wheelchair_accessible values
      if ( row.wheelchair_accessible === null ) {
        row.wheelchair_accessible = Trip.WHEELCHAIR_ACCESSIBLE_UNKNOWN;
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

      // Add Trip to Cache
      cache_tripsById.put(cacheKey, trip);

      // Return trip with callback
      return callback(null, trip);

    });

  });

};


/**
 * Get the Trip specified by the Trip short name that operates on the specified date
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {string} shortName Trip short name
 * @param {int} date Date Integer (yyyymmdd)
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Trip} [callback.trip] The selected Trip
 */
function getTripByShortName(db, shortName, date, callback) {

  // Check Cache for Trip
  let cacheKey = db.id + "-" + shortName + "-" + date;
  let cache = cache_tripsByShortName.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Get effective service ids
  _buildEffectiveServiceIDString(db, date, function(err, serviceIdString) {
    if ( err ) {
      return callback(err);
    }

    // Get Trip ID
    let select = "SELECT trip_id FROM gtfs_trips WHERE trip_short_name = '" +
      shortName + "' AND service_id IN " + serviceIdString + ";";

    // Query database
    db.get(select, function(err, result) {
      if ( err ) {
        return callback(err);
      }

      // No Trip Found
      if ( result === undefined ) {
        return callback(null, undefined);
      }

      // Get the Trip
      getTrip(db, result.trip_id, date, function(err, trip) {

        // Add Trip to Cache
        cache_tripsByShortName.put(cacheKey, trip);

        // Return Trip
        return callback(err, trip);

      });

    });

  });

}


/**
 * Find the Trip that leaves the specified origin Stop for the specified
 * destination Stop at the departure time specified by the DateTime
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {string} originId Origin Stop ID
 * @param {string} destinationId Destination Stop ID
 * @param {DateTime} departure DateTime of trip departure
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Trip} [callback.trip] The selected Trip
 */
function getTripByDeparture(db, originId, destinationId, departure, callback) {

  // Check cache for trip
  let cacheKey = db.id + "-" + originId + "-" + destinationId + "-" + departure.getTimeSeconds() + "-" + departure.getDateInt();
  let cache = cache_tripsByDeparture.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Check to make sure both origin and destination have IDs set
  if ( originId === "" || originId === undefined ||
      destinationId === "" || destinationId === undefined ) {
    return callback(
      new Error('Could not get Trip, origin and/or destination id not set')
    );
  }


  // ORIGINAL DEPARTURE DATE
  _getTripByDeparture(db, originId, destinationId, departure, function(err, trip) {
    if ( err ) {
      return callback(err);
    }

    // Trip Found...
    if ( trip !== undefined ) {
      cache_tripsByDeparture.put(cacheKey, trip);
      return callback(null, trip);
    }


    // PREVIOUS DEPARTURE DATE, +24 HOUR TIME
    let prev = DateTime.create(
      departure.getTimeSeconds() + 86400,
      departure.clone().deltaDays(-1).getDateInt()
    );

    _getTripByDeparture(db, originId, destinationId, prev, function(err, trip) {

      // Return results
      cache_tripsByDeparture.put(cacheKey, trip);
      return callback(err, trip);

    });


  });

}

/**
 * Get the Trip that matches the origin, destination and departure information
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {string} originId Origin Stop ID
 * @param {string} destinationId Destination Stop ID
 * @param {DateTime} departure Departure DateTime
 * @param {function} callback getTrip callback function(err, trip)
 * @private
 */
function _getTripByDeparture(db, originId, destinationId, departure, callback) {

  // Get Effective Services for departure date
  _buildEffectiveServiceIDString(db, departure.getDateInt(), function(err, serviceIdString) {
    if ( err ) {
      return callback(err);
    }

    // Find a matching trip
    _getMatchingTripId(db, originId, destinationId, departure, serviceIdString, function(err, tripId) {
      if ( err ) {
        return callback(err);
      }

      // --> No matching trip found
      if ( tripId === undefined ) {
        return callback(null, undefined);
      }

      // Build the matching trip...
      getTrip(db, tripId, departure.getDateInt(), function(err, trip) {
        if ( err ) {
          return callback(err);
        }

        // --> Return the matching trip
        return callback(err, trip);

      });

    });

  });

}

/**
 * Build the Effective Service ID String for SELECT query
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {int} date Date Integer (yyyymmdd)
 * @param {function} callback Callback function(err, serviceIdString)
 * @private
 */
function _buildEffectiveServiceIDString(db, date, callback) {

  // Query the Calendar for effective services
  CalendarTable.getServicesEffective(db, date, function(err, services) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // Build Service ID String
    let serviceIds = [];
    for ( let i = 0; i < services.length; i++ ) {
      serviceIds.push(services[i].id);
    }
    let serviceIdString = "('" + serviceIds.join("', '") + "')";

    // Return Service ID String
    return callback(null, serviceIdString);

  });

}

/**
 * Get the Trip ID of the trip matching the origin, destination, and departure information
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {string} originId Origin Stop ID
 * @param {string} destinationId Destination Stop ID
 * @param {DateTime} departure DateTime of departure
 * @param {string} serviceIdString Effective Service ID string
 * @param {function} callback Callback function(err, tripId)
 * @private
 */
function _getMatchingTripId(db, originId, destinationId, departure, serviceIdString, callback) {

  // Find a matching trip in the gtfs_stop_times table
  let select = "SELECT trip_id FROM gtfs_trips " +
    "WHERE service_id IN " + serviceIdString + " " +
    "AND trip_id IN (" +
    "SELECT trip_id FROM gtfs_stop_times WHERE stop_id='" + destinationId + "' " +
    "AND trip_id IN (" +
    "SELECT trip_id FROM gtfs_stop_times " +
    "WHERE stop_id='" + originId + "' AND departure_time_seconds=" + departure.getTimeSeconds() +
    "));";

  // Query the database
  db.select(select, function(err, results) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // No results found
    if ( results.length === 0 ) {
      return callback(null, undefined);
    }

    // Find the best match
    let found = false;
    let count = 0;
    for ( let j = 0; j < results.length; j++ ) {
      let row = results[j];

      // Get StopTimes for origin and destination
      StopTimesTable.getStopTimeByTripStop(db, row.trip_id, originId, departure.getDateInt(), function(orErr, originStopTime) {
        StopTimesTable.getStopTimeByTripStop(db, row.trip_id, destinationId, departure.getDateInt(), function(deErr, destinationStopTime) {
          if ( orErr ) {
            return callback(orErr);
          }
          if ( deErr ) {
            return callback(deErr);
          }

          // Check stop sequence
          // If origin comes before destination, use that trip
          if ( originStopTime.stopSequence <= destinationStopTime.stopSequence ) {
            found = true;
            return callback(null, row.trip_id);
          }

          // No match found
          count ++;
          if ( !found && count === results.length ) {
            return callback(null, undefined);
          }

        });
      });

    }

  });

}



// ==== SETUP CACHES ==== //
let cache_tripsById = new cache.Cache();
let cache_tripsByShortName = new cache.Cache();
let cache_tripsByDeparture = new cache.Cache();

/**
 * Clear the TripsTable caches
 * @private
 */
function clearCache() {
  cache_tripsById.clear();
  cache_tripsByShortName.clear();
  cache_tripsByDeparture.clear();
}



// Export Functions
module.exports = {
  getTrip: getTrip,
  getTripByShortName: getTripByShortName,
  getTripByDeparture: getTripByDeparture,
  clearCache: clearCache
};