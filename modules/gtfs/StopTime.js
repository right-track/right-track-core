'use strict';

/**
 * GTFS StopTime Class
 * @see {@link StopTime}
 * @module gtfs/StopTime
 */

const DateTime = require('../utils/DateTime.js');

/**
 * GTFS StopTime
 * --------------
 * Representation of the GTFS StopTime definition.
 *
 * GTFS Required Fields:
 * - Stop (associated with stop_id)
 * - Arrival Time (String HH:mm:ss)
 * - Departure Time (String HH:mm:ss)
 * - Stop Sequence (integer, 1-->...)
 *
 * GTFS Optional Fields:
 * - Arrival Time Seconds (integer, seconds since midnight)
 * - Departure Time Seconds (integer, seconds since midnight)
 * - Pickup Type
 * - Drop Off Type
 *
 * Right Track Fields:
 * - Date (yyyymmdd)
 *
 * **Module:** {@link module:gtfs/StopTime|gtfs/StopTime}
 *
 * @see {@link https://developers.google.com/transit/gtfs/reference/stops_times-file|GTFS Spec}
 * @class
 * @alias StopTime
 */
class StopTime {

  /**
   * StopTime Constructor
   * @constructor
   * @param {Stop} stop StopTime Stop
   * @param {string} arrivalTime StopTime Arrival Time (GTFS Time String)
   * @param {string} departureTime StopTime Departure Time (GTFS Time String)
   * @param {int} stopSequence StopTime Stop Sequence
   * @param {int} [arrivalTimeSeconds] StopTime Arrival Time (Time Seconds)
   * @param {int} [departureTimeSeconds] StopTime Departure Time (Time Seconds)
   * @param {int} [pickupType] StopTime Pickup Type
   * @param {int} [dropOffType] StopTime Drop Off Type
   * @param {int} [date] StopTime date (yyyymmdd)
   */
  constructor(stop, arrivalTime, departureTime, stopSequence,
              arrivalTimeSeconds, departureTimeSeconds, pickupType=StopTime.PICKUP_TYPE_REGULAR,
              dropOffType=StopTime.DROP_OFF_TYPE_REGULAR, date=19700101) {

    /**
     * The Stop for this scheduled StopTime
     * @type {Stop}
     */
    this.stop = stop;

    /**
     * The trip's arrival time for this scheduled StopTime in HH:MM:SS format
     * @type {string}
     */
    this.arrivalTime = arrivalTime;

    /**
     * The trip's departure time for this scheduled StopTime in HH:MM:SS format
     * @type {string}
     */
    this.departureTime = departureTime;

    /**
     * The StopTime's sequence in the scheduled Trip
     * @type {int}
     */
    this.stopSequence = stopSequence;

    /**
     * The StopTime's arrival time in seconds since midnight
     * @type {Number}
     */
    this.arrivalTimeSeconds = (typeof arrivalTimeSeconds !== 'undefined')
      ? arrivalTimeSeconds
      : new DateTime(arrivalTime, date).getTimeSeconds();

    /**
     * The StopTime's departure time in seconds since midnight
     * @type {Number}
     */
    this.departureTimeSeconds = (typeof departureTimeSeconds !== 'undefined')
      ? departureTimeSeconds
      : new DateTime(departureTime, date).getTimeSeconds();

    /**
     * Value indicating whether passengers are picked up at the Stop
     * @type {int}
     */
    this.pickupType = pickupType;

    /**
     * Value indicating whether passengers are dropped off at the Stop
     * @type {int}
     */
    this.dropOffType = dropOffType;

    /**
     * The date of the Trip in YYYYMMDD format
     * @type {Number}
     */
    this.date = date;

  }

}


// ==== STOPTIME PICKUP TYPES ==== //

/**
 * Pickup Type: Regularly scheduled pickup
 * @const {number}
 * @default 0
 */
StopTime.PICKUP_TYPE_REGULAR = 0;

/**
 * Pickup Type: No pickup available
 * @const {number}
 * @default
 */
StopTime.PICKUP_TYPE_NONE = 1;

/**
 * Pickup Type: Phone agency to arrange
 * @const {number}
 * @default
 */
StopTime.PICKUP_TYPE_PHONE_AGENCY = 2;

/**
 * Pickup Type: Coordinate with driver
 * @const {number}
 * @default
 */
StopTime.PICKUP_TYPE_DRIVER_COORDINATION = 3;



// ==== STOPTIME DROP OFF TYPE ==== //

/**
 * Drop Off Type: Regularly scheduled drop off
 * @const {number}
 * @default 0
 */
StopTime.DROP_OFF_TYPE_REGULAR = 0;

/**
 * Drop Off Type: No drop off available
 * @const {number}
 * @default
 */
StopTime.DROP_OFF_TYPE_NONE = 1;

/**
 * Drop Off Type: Phone agency to arrange
 * @const {number}
 * @default
 */
StopTime.DROP_OFF_TYPE_PHONE_AGENCY = 2;

/**
 * Drop Off Type: Coordinate with driver
 * @const {number}
 * @default
 */
StopTime.DROP_OFF_TYPE_DRIVER_COORDINATION = 3;



// ==== SORT METHODS ==== //

/**
 * Sort StopTimes by the Stop's Transfer Weight (descending)
 * @param {StopTime} a first StopTime
 * @param {StopTime} b second StopTime
 * @returns {number} compare integer
 */
StopTime.sortByStopTransferWeight = function(a, b) {
  if ( a.stop.transferWeight > b.stop.transferWeight ) {
    return -1;
  }
  else if ( a.stop.transferWeight < b.stop.transferWeight ) {
    return 1;
  }
  else {
    return 0;
  }
};

/**
 * Sort StopTimes by their stop sequence
 * @param {StopTime} a first StopTime
 * @param {StopTime} b second StopTime
 * @return {number} compare integer
 */
StopTime.sortByStopSequence = function(a, b) {
  if ( a.stopSequence < b.stopSequence ) {
    return -1;
  }
  else if ( a.stopSequence > b.stopSequence ) {
    return 1;
  }
  else {
    return 0;
  }
};



module.exports = StopTime;
