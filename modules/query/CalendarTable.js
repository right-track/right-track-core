'use strict';

/**
 * ### Service and ServiceException Query Functions
 * These functions query the `gtfs_calendar` and `gtfs_calendar_dates` tables
 * in the Right Track Database.
 * @module query/calendar
 */

const cache = require('memory-cache');
const Service = require('../gtfs/Service.js');
const ServiceException = require('../gtfs/ServiceException.js');
const DateTime = require('../utils/DateTime.js');


// ==== QUERY FUNCTIONS ==== //

/**
 * Get the Service(s) specified by Service ID(s) from the passed
 * database.  The Service will also include any included Service
 * Exceptions for the Service.
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {String|String[]} id Service ID or list of Service IDs
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Service|Service[]} callback.service The selected Service(s)
 */
function getService(db, id, callback) {

  // When given a list of service ids to parse...
  if ( id instanceof Array ) {

    // list of services to return
    let rtn = [];

    // Parse each passed service id
    let count = 0;
    for ( let i = 0; i < id.length; i++ ) {
      let serviceId = id[i];

      // Build the Service
      getService(db, serviceId, function(err, service) {
        if ( err ) {
          return callback(err);
        }

        // Add Service to list
        rtn.push(service);

        // Return list of Services with callback after all have finished
        count++;
        if ( count === id.length ) {
          return callback(null, rtn);
        }
      });

    }

  }


  // When given a single service id to query...
  else {

    // Check cache for Service
    let cacheKey = db.id + "-" + id;
    let cache = cache_serviceById.get(cacheKey);
    if ( cache !== null ) {
      return callback(null, cache);
    }

    // Get the service exceptions for the specified service
    let select = "SELECT date, exception_type FROM gtfs_calendar_dates WHERE " +
    "service_id='" + id + "' ORDER BY date ASC;";

    // Query the database
    db.select(select, function(err, results) {

      // Database Query Error
      if ( err ) {
        return callback(err);
      }

      // List of service exceptions and start and end dates
      let exceptions = [];
      let start_date = 0;
      let end_date = 0;


      // Parse each returned row
      for ( let i = 0; i < results.length; i++ ) {
        let row = results[i];

        let se = new ServiceException(
          id,
          row.date,
          row.exception_type
        );

        // Add Service Exception to list
        exceptions.push(se);

        if ( i === 0 ) {
          start_date = row.date;
        }
        else if ( i === results.length-1 ) {
          end_date = row.date;
        }
      }


      // Get the default service information
      let select = "SELECT monday, tuesday, wednesday, thursday, friday, saturday, sunday, " +
        "start_date, end_date FROM gtfs_calendar WHERE service_id='" + id + "';";

      // Query the database
      db.get(select, function(err, result) {

        // Database Query Error
        if ( err ) {
          return callback(err);
        }

        // Defaults, when no service in calendar table
        let mon = 0;
        let tue = 0;
        let wed = 0;
        let thu = 0;
        let fri = 0;
        let sat = 0;
        let sun = 0;

        // Get values selected from database
        if ( result !== undefined ) {
          mon = result.monday;
          tue = result.tuesday;
          wed = result.wednesday;
          thu = result.thursday;
          fri = result.friday;
          sat = result.saturday;
          sun = result.sunday;
          start_date = result.start_date;
          end_date = result.end_date;
        }

        // Create Service
        let service = new Service(
          id,
          mon,
          tue,
          wed,
          thu,
          fri,
          sat,
          sun,
          start_date,
          end_date,
          exceptions
        );

        // Save Service in cache
        cache_serviceById.put(cacheKey, service);

        // return service in callback, if provided
        return callback(null, service);

      });

    });

  }

}

/**
 * Get the Services in effect on the specified date.  This includes
 * any exceptions found in the calendar_dates file.
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {int} date The date to query (yyyymmdd)
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Service[]} callback.services The selected Services
 */
function getServicesEffective(db, date, callback) {

  // Check Cache for Effective Services
  let cacheKey = db.id + "-" + date;
  let cache = cache_servicesEffectiveByDate.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Get the Default Services
  getServicesDefault(db, date, function(defaultError, defaultServices) {

    // Get the Service Exceptions
    getServiceExceptions(db, date, function(exceptionsError, serviceExceptions) {


      // Check for Default Services Error
      if ( defaultError ) {
        return callback(defaultError);
      }

      // Check for Service Exceptions Error
      if ( exceptionsError ) {
        return callback(exceptionsError);
      }


      // List of Service IDs to Add to Default Services
      let serviceIdsToAdd = [];

      // Parse the exceptions
      for ( let i = 0; i < serviceExceptions.length; i++ ) {
        let serviceException = serviceExceptions[i];

        // Exception Type: Added
        if ( serviceException.exceptionType === ServiceException.SERVICE_ADDED ) {

          // Make sure service isn't already in list
          let found = false;
          for ( let j = 0; j < defaultServices.length; j++ ) {
            if ( defaultServices[j].id === serviceException.serviceId ) {
              found = true;
            }
          }

          // Flag Service ID to add
          if ( !found ) {
            serviceIdsToAdd.push(serviceException.serviceId);
          }

        }

        // Exception Type: Removed
        else if ( serviceException.exceptionType === ServiceException.SERVICE_REMOVED ) {

          // Find matching default service
          let removeIndex = -1;
          for ( let j = 0; j < defaultServices.length; j++ ) {
            if ( defaultServices[j].id === serviceException.serviceId ) {
              removeIndex = j;
            }
          }

          // Remove the matching service from default services list
          if ( removeIndex !== -1 ) {
            defaultServices.splice(removeIndex, 1);
          }

        }

      }


      // Add services, if we need to
      if ( serviceIdsToAdd.length > 0 ) {
        getService(db, serviceIdsToAdd, function(err, services) {

          // Error Getting Services
          if ( err ) {
            return callback(err);
          }

          // Add Services to list
          for (let i = 0; i < services.length; i++) {
            let service = services[i];
            defaultServices.push(service);
          }

          // Add Services to Cache
          cache_servicesEffectiveByDate.put(cacheKey, defaultServices);

          // Return Services
          return callback(null, defaultServices);

        });
      }

      // Return Default Services
      else {

        // Add Services to Cache
        cache_servicesEffectiveByDate.put(cacheKey, defaultServices);

        return callback(null, defaultServices);

      }


    });

  });

}


/**
 * Get the default Services in effect on the specified date.  These
 * services don't include any changes due to service exceptions.
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {int} date The date to query (yyyymmdd)
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Service[]} callback.services The selected Services
 */
let getServicesDefault = function(db, date, callback) {

  // Check cache for services
  let cacheKey = db.id + "-" + date;
  let cache = cache_servicesDefaultByDate.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Array of default services to return
  let rtn = [];

  // Get day of week
  let dt = DateTime.createFromDate(date);
  let dow = dt.getDateDOW();

  // Get default services
  let select = "SELECT service_id, monday, tuesday, wednesday, thursday, friday, " +
    "saturday, sunday, start_date, end_date FROM gtfs_calendar WHERE " + dow +
    "=" + Service.SERVICE_AVAILABLE + " AND start_date<=" + date + " AND " +
    "end_date>=" + date + ";";

  // Query the database
  db.select(select, function(err, results) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }


    // Parse each row in the results...
    for ( let i = 0; i < results.length; i++ ) {
      let row = results[i];

      let service = new Service(
        row.service_id,
        row.monday,
        row.tuesday,
        row.wednesday,
        row.thursday,
        row.friday,
        row.saturday,
        row.sunday,
        row.start_date,
        row.end_date
      );

      rtn.push(service);
    }

    // Add Services to Cache
    cache_servicesDefaultByDate.put(cacheKey, rtn);

    // Return the default services with provided callback
    return callback(null, rtn);

  });

};


/**
 * Get the Service Exceptions in effect on the specified date.  This includes
 * Services that are either added or removed on the specified date.
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {int} date The date to query (yyyymmdd)
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {ServiceException[]} callback.services The selected Service Exceptions
 */
let getServiceExceptions = function(db, date, callback) {

  // Check cache for service exceptions
  let cacheKey = db.id + "-" + date;
  let cache = cache_serviceExceptionsByDate.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Array of Service Exceptions to return
  let rtn = [];

  // Get service exceptions from calendar_dates
  let select = "SELECT service_id, date, exception_type " +
    "FROM gtfs_calendar_dates WHERE date=" + date + ";";

  // Query the database
  db.select(select, function(err, results) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // Parse each row in the results
    for ( let i = 0; i < results.length; i++ ) {
      let row = results[i];

      // Create Service Exception
      let se = new ServiceException(
        row.service_id,
        row.date,
        row.exception_type
      );

      // Add Service Exception to return list
      rtn.push(se);
    }

    // Add Service Exceptions to cache
    cache_serviceExceptionsByDate.put(cacheKey, rtn);

    // Return service exceptions with provided callback
    return callback(null, rtn);

  });

};



// ==== SETUP CACHES ==== //
let cache_serviceById = new cache.Cache();
let cache_servicesEffectiveByDate = new cache.Cache();
let cache_servicesDefaultByDate = new cache.Cache();
let cache_serviceExceptionsByDate = new cache.Cache();

/**
 * Clear the CalendarTable caches
 * @private
 */
function clearCache() {
  cache_serviceById.clear();
  cache_servicesEffectiveByDate.clear();
  cache_servicesDefaultByDate.clear();
  cache_serviceExceptionsByDate.clear();
}



// Export the functions
module.exports = {
  getService: getService,
  getServicesEffective: getServicesEffective,
  getServicesDefault: getServicesDefault,
  getServiceExceptions: getServiceExceptions,
  clearCache: clearCache
};