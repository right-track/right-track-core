'use strict';

/**
 * GTFS ServiceException Class
 * @see {@link ServiceException}
 * @module gtfs/ServiceException
 */

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
 * **Module:** {@link module:gtfs/ServiceException|gtfs/ServiceException}
 *
 * @see {@link https://developers.google.com/transit/gtfs/reference/calendar_dates-file|GTFS Spec}
 * @class
 * @alias ServiceException
 */
class ServiceException {

  /**
   * Service Exception Constructor
   * @constructor
   * @param {string} serviceId Service ID
   * @param {int} date Service Date (yyyymmdd)
   * @param {int} exceptionType Service Exception Type
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
 * @const {number}
 * @default
 */
ServiceException.SERVICE_ADDED = 1;

/**
 * Service Exception Type: Service Removed
 * @const {number}
 * @default
 */
ServiceException.SERVICE_REMOVED = 2;


module.exports = ServiceException;
