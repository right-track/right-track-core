'use strict';

/**
 * GTFS Service Class
 * @see {@link Service}
 * @module gtfs/Service
 */

/**
 * GTFS Service
 * ------------
 * Representation of a row in the GTFS Calendar table.
 *
 * GTFS Required Fields:
 * - Service ID
 * - Monday
 * - Tuesday
 * - Wednesday
 * - Thursday
 * - Friday
 * - Saturday
 * - Sunday
 * - Start Date
 * - End Date
 *
 * GTFS Optional Fields:
 * - Service Exceptions
 *
 * **Module:** {@link module:gtfs/Service|gtfs/Service}
 *
 * @see {@link https://developers.google.com/transit/gtfs/reference/calendar-file|GTFS Spec}
 * @class
 * @alias Service
 */
class Service {

  /**
   * Service Constructor
   * @constructor
   * @param {string} serviceId Service ID
   * @param {int} mon Service availability for Monday
   * @param {int} tue Service availability for Tuesday
   * @param {int} wed Service availability for Wednesday
   * @param {int} thu Service availability for Thursday
   * @param {int} fri Service availability for Friday
   * @param {int} sat Service availability for Saturday
   * @param {int} sun Service availability for Sunday
   * @param {int} startDate Service Start Date (yyyymmdd)
   * @param {int} endDate Service End Date (yyyymmdd)
   * @param {ServiceException[]} [exceptions=[]] List of Service Exceptions
   */
  constructor(serviceId, mon, tue, wed, thu, fri, sat, sun, startDate, endDate,
              exceptions=[]) {
    this.id = serviceId;
    this.monday = mon;
    this.tuesday = tue;
    this.wednesday = wed;
    this.thursday = thu;
    this.friday = fri;
    this.saturday = sat;
    this.sunday = sun;
    this.startDate = startDate;
    this.endDate = endDate;
    this.serviceExceptions = exceptions;
  }

}


// ==== SERVICE AVAILABILITY CODES ==== //

/**
 * Service Availability: Available
 * @const {number}
 * @default
 */
Service.SERVICE_AVAILABLE = 1;

/**
 * Service Availability: Unavailable
 * @const {number}
 * @default 0
 */
Service.SERVICE_UNAVAILABLE = 0;


module.exports = Service;
