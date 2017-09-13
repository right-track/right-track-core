'use strict';

const Holiday = require("../rt/Holiday.js");


// ==== CALLBACK FUNCTIONS ==== //

/**
 * This callback is performed after a single Holiday has been
 * selected from the database.
 * @callback getHolidayCallback
 * @param {Holiday} holiday The selected Holiday
 */

/**
 * This callback is performed after multiple Holidays have been
 * selected from the database.
 * @callback getHolidaysCallback
 * @param {Holiday[]} holidays The selected Holidays
 */

/**
 * This callback is performed after checking to see if a
 * specified date is listed as a Holiday
 * @callback isHolidayCallback
 * @param {boolean} isHoliday true/false if date is Holiday
 */


// ==== QUERY FUNCTIONS ==== //

/**
 * Get a list of Holidays that are stored in the specified
 * database.
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {getHolidaysCallback} callback getHolidays callback function
 */
let getHolidays = function(db, callback) {

    // Build select statement
    let select = "SELECT date, holiday_name, peak, " +
        "service_info FROM rt_holidays";

    // Query the database
    db.select(select, function(results) {

        // list of Holidays to return
        let rtn = [];

        // Parse the results...
        if ( results !== undefined ) {

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

        }


        // Return list of holidays with callback
        if ( callback !== undefined ) {
            callback(rtn);
        }

    });

};


/**
 * Get the Holiday for the specified date or 'undefined' if
 * there is no holiday on the date
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {int} date the date (yyyymmdd)
 * @param {getHolidayCallback} callback getHoliday callback function
 */
let getHoliday = function(db, date, callback) {

    // Build the select statement
    let select = "SELECT date, holiday_name, peak, service_info " +
        "FROM rt_holidays WHERE date=" + date;

    console.log(select);

    // Query the database
    db.get(select, function(result) {

        // Parse the result
        if ( result !== undefined ) {

            // Build the Holiday
            let holiday = new Holiday(
                result.date,
                result.holiday_name,
                result.peak,
                result.service_info
            );

            // Return the holiday with the specified callback
            if ( callback !== undefined ) {
                callback(holiday);
            }
        }

        // No holiday found, return undefined with the specified callback
        else {
            if ( callback !== undefined ) {
                callback(undefined);
            }
        }

    })

};


/**
 * Check if the specified date is a Holiday
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {int} date The date to check (yyyymmdd)
 * @param {isHolidayCallback} callback isHoliday callback function
 */
let isHoliday = function(db, date, callback) {

    // Get matching holiday
    let select = "SELECT date, holiday_name, peak, service_info " +
        "FROM rt_holidays WHERE date=" + date;

    // Query the database
    db.get(select, function(result) {

        // Return if holiday is found with callback
        if ( callback !== undefined ) {
            callback(result !== undefined);
        }

    });

};



// Export the functions
module.exports = {
    getHolidays: getHolidays,
    getHoliday: getHoliday,
    isHoliday: isHoliday
};