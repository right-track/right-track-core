'use strict';

/**
 * GTFS Service Exception
 * ----------------------
 * Representation of a row in the GTFS Calendar_Dates table.
 *
 * GTFS Required Fields:
 * - Service ID
 * - Date
 * - Exception Type
 *
 * @see {@link https://developers.google.com/transit/gtfs/reference/calendar_dates-file|GTFS Spec}
 * @class
 */
class ServiceException {

    /**
     * Service Exception Constructor
     * @constructor
     * @param {string} serviceId Service ID
     * @param {int} date Service Date (yyyymmdd)
     * @param {int} excpetionType Service Exception Type
     */
    constructor(serviceId, date, exceptionType) {
        this.serviceId = serviceId;
        this.date = date;
        this.exceptionType = exceptionType;
    }
    
}


// ==== SERVICE EXCEPTION TYPE CODES ==== //

/**
 * Service Exception Type: Service Added
 * @type {number}
 */
ServiceException.SERVICE_ADDED = 1;

/**
 * Service Exception Type: Service Removed
 * @type {number}
 */
ServiceException.SERVICE_REMOVED = 2;


module.exports = ServiceException;
