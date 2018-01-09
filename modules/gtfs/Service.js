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

    /**
     * A unique ID that identifies the service
     * @type {string}
     */
    this.id = serviceId;

    /**
     * A binary value indicating whether the service is valid for all Mondays
     * @type {int}
     */
    this.monday = mon;

    /**
     * A binary value indicating whether the service is valid for all Tuesdays
     * @type {int}
     */
    this.tuesday = tue;

    /**
     * A binary value indicating whether the service is valid for all Wednesdays
     * @type {int}
     */
    this.wednesday = wed;

    /**
     * A binary value indicating whether the service is valid for all Thursdays
     * @type {int}
     */
    this.thursday = thu;

    /**
     * A binary value indicating whether the service is valid for all Fridays
     * @type {int}
     */
    this.friday = fri;

    /**
     * A binary value indicating whether the service is valid for all Saturdays
     * @type {int}
     */
    this.saturday = sat;

    /**
     * A binary value indicating whether the service is valid for all Sundays
     * @type {int}
     */
    this.sunday = sun;

    /**
     * The start date for the service in YYYYMMDD format
     * @type {Number}
     */
    this.startDate = startDate;

    /**
     * The end date for the service in YYYYMMDD format
     * @type {Number}
     */
    this.endDate = endDate;

    /**
     * A list of Service Exceptions (additions and/or removals of regular service
     * on specific dates) for the Service
     * @type {ServiceException[]}
     */
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
