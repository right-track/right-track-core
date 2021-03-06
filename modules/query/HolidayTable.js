'use strict';

/**
 * ### Holiday Query Functions
 * These functions query the `rt_holidays` table in the Right Track Database.
 * @module query/holiday
 */

const cache = require('memory-cache');
const Holiday = require('../rt/Holiday.js');


// ==== QUERY FUNCTIONS ==== //

/**
 * Get a list of Holidays that are stored in the specified
 * database.
 *
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Holiday[]} [callback.holidays] The selected Holidays
 */
function getHolidays(db, callback) {

  // Check cache for holidays
  let cacheKey = db.id + "-" + 'holidays';
  let cache = cache_holidays.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Build select statement
  let select = "SELECT date, holiday_name, peak, service_info FROM rt_holidays";

  // Query the database
  db.select(select, function(err, results) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // list of Holidays to return
    let rtn = [];

    // Parse each row of the results
    for ( let i = 0; i < results.length; i++ ) {
      let row = results[i];

      // Build holiday
      let holiday = new Holiday(
        row.date,
        row.holiday_name,
        row.peak,
        row.service_info
      );

      // Add holiday to list
      rtn.push(holiday);
    }

    // Add Holidays to cache
    cache_holidays.put(cacheKey, rtn);

    // Return list of holidays with callback
    return callback(null, rtn);

  });

}


/**
 * Get the Holiday for the specified date or 'undefined' if
 * there is no holiday on the date
 *
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {int} date the date (yyyymmdd)
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Holiday} [callback.holiday] The selected Holiday
 */
function getHoliday(db, date, callback) {

  // Check cache for Holiday
  let cacheKey = db.id + "-" + date;
  let cache = cache_holidayByDate.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Build the select statement
  let select = "SELECT date, holiday_name, peak, service_info " +
    "FROM rt_holidays WHERE date=" + date;

  // Query the database
  db.get(select, function(err, result) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // Holiday to return
    let holiday = undefined;

    // Holiday was found...
    if ( result !== undefined ) {

      // Build the Holiday
      holiday = new Holiday(
        result.date,
        result.holiday_name,
        result.peak === 1,
        result.service_info
      );

    }

    // Add holiday to cache
    cache_holidayByDate.put(cacheKey, holiday);

    // Return the holiday
    return callback(null, holiday);

  })

}


/**
 * Check if the specified date is a Holiday
 *
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {int} date The date to check (yyyymmdd)
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {boolean} [callback.isHoliday] True if the specified date is a Holiday
 */
function isHoliday(db, date, callback) {

  // Check cache for is holiday
  let cacheKey = db.id + "-" + date;
  let cache = cache_isHolidayByDate.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Get matching holiday
  let select = "SELECT date, holiday_name, peak, service_info " +
    "FROM rt_holidays WHERE date=" + date;

  // Query the database
  db.get(select, function(err, result) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // Add result to cache
    cache_isHolidayByDate.put(cacheKey, result !== undefined);

    // Return if holiday is found with callback
    return callback(null, result !== undefined);

  });

}



// ==== SETUP CACHES ==== //
let cache_holidays = new cache.Cache();
let cache_holidayByDate = new cache.Cache();
let cache_isHolidayByDate = new cache.Cache();

/**
 * Clear the HolidayTable caches
 * @private
 */
function clearCache() {
  cache_holidays.clear();
  cache_holidayByDate.clear();
  cache_isHolidayByDate.clear();
}


// Export the functions
module.exports = {
  getHolidays: getHolidays,
  getHoliday: getHoliday,
  isHoliday: isHoliday,
  clearCache: clearCache,
};