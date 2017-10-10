'use strict';

/**
 * ### Holiday Query Functions
 * These functions query the `rt_holidays` table in the Right Track Database.
 * @module query/holiday
 */

const Holiday = require('../rt/Holiday.js');


// ==== CALLBACK FUNCTIONS ==== //

/**
 * This callback is performed after a single Holiday has been
 * selected from the database.
 * @callback module:query/holiday~getHolidayCallback
 * @param {Error} error Database Query Error
 * @param {Holiday} [holiday] The selected Holiday
 */

/**
 * This callback is performed after multiple Holidays have been
 * selected from the database.
 * @callback module:query/holiday~getHolidaysCallback
 * @param {Error} error Database Query Error
 * @param {Holiday[]} [holidays] The selected Holidays
 */

/**
 * This callback is performed after checking to see if a
 * specified date is listed as a Holiday
 * @callback module:query/holiday~isHolidayCallback
 * @param {Error} error Database Query Error
 * @param {boolean} [isHoliday] true/false if date is Holiday
 */


// ==== QUERY FUNCTIONS ==== //

/**
 * Get a list of Holidays that are stored in the specified
 * database.
 *
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {function} callback {@link module:query/holiday~getHolidaysCallback|getHolidaysCallback} callback function
 */
function getHolidays(db, callback) {

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
 * @param {function} callback {@link module:query/holiday~getHolidayCallback|getHolidayCallback} callback function
 */
function getHoliday(db, date, callback) {

  // Build the select statement
  let select = "SELECT date, holiday_name, peak, service_info " +
    "FROM rt_holidays WHERE date=" + date;

  console.log(select);

  // Query the database
  db.get(select, function(err, result) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // Holiday was found...
    if ( result !== undefined ) {

      // Build the Holiday
      let holiday = new Holiday(
        result.date,
        result.holiday_name,
        result.peak,
        result.service_info
      );

      // Return the holiday with the specified callback
      return callback(null, holiday);

    }

    // No holiday found, return undefined with the specified callback
    else {
        return callback(null, undefined);
    }

  })

}


/**
 * Check if the specified date is a Holiday
 *
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {int} date The date to check (yyyymmdd)
 * @param {function} callback {@link module:query/holiday~isHolidayCallback|isHolidayCallback} callback function
 */
function isHoliday(db, date, callback) {

  // Get matching holiday
  let select = "SELECT date, holiday_name, peak, service_info " +
    "FROM rt_holidays WHERE date=" + date;

  // Query the database
  db.get(select, function(err, result) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // Return if holiday is found with callback
    return callback(null, result !== undefined);

  });

}



// Export the functions
module.exports = {
  getHolidays: getHolidays,
  getHoliday: getHoliday,
  isHoliday: isHoliday
};