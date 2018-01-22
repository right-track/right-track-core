'use strict';

/**
 * GTFS StopTime Class
 * @see {@link StopTime}
 * @module gtfs/StopTime
 */

const provided = require('../utils/provided.js');
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
 * - Stop Headsign
 * - Pickup Type
 * - Drop Off Type
 * - Shape Distance Traveled
 * - Timepoint
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
   * @param {Object} [optional] Optional Arguments
   * @param {string} [optional.headsign] The Trip headsign at this Stop
   * @param {int} [optional.pickupType=0] Stop Pickup Type
   * @param {int} [optional.dropOffType=0] Stop Drop Off Type
   * @param {number} [optional.shapeDistanceTraveled] The distance traveled from the first shape point
   * @param {int} [optional.timepoint=1] Indicate if the arrival and departure times are exact or approximate
   * @param {int} [optional.date=19700101] StopTime date (yyyymmdd)
   */
  constructor(stop, arrivalTime, departureTime, stopSequence, optional={}) {

    /**
     * The Stop for this scheduled StopTime
     * @type {Stop}
     */
    this.stop = stop;

    /**
     * The date of the Trip in YYYYMMDD format
     * @type {Number}
     * @default 1970101
     */
    this.date = provided(optional.date, 19700101);

    /**
     * The trip's arrival time for this scheduled StopTime in HH:MM:SS format
     * @type {string}
     */
    this.arrivalTime = arrivalTime;

    /**
     * The trip's arrival Date/Time
     * @type {DateTime}
     */
    this.arrival = new DateTime(arrivalTime, this.date);

    /**
     * The trip's departure time for this scheduled StopTime in HH:MM:SS format
     * @type {string}
     */
    this.departureTime = departureTime;

    /**
     * The trip's departure Date/Time
     * @type {DateTime}
     */
    this.departure = new DateTime(departureTime, this.date);

    /**
     * The StopTime's sequence in the scheduled Trip
     * @type {int}
     */
    this.stopSequence = stopSequence;

    /**
     * Value indicating whether passengers are picked up at the Stop
     * @type {int}
     * @default 0
     */
    this.pickupType = provided(optional.pickupType, StopTime.PICKUP_TYPE_REGULAR);

    /**
     * Value indicating whether passengers are dropped off at the Stop
     * @type {int}
     * @default 0
     */
    this.dropOffType = provided(optional.dropOffType, StopTime.DROP_OFF_TYPE_REGULAR);

    /**
     * If the Trip Headsign changes along the Trip, this is the Trip Headsign
     * displayed at this Stop
     * @type {string}
     */
    this.headsign = provided(optional.headsign);

    /**
     * The actual distance traveled from the first shape point
     * @type {number}
     */
    this.shapeDistanceTraveled = provided(optional.shapeDistanceTraveled);

    /**
     * Indicates whether the arrival and departure times should be considered
     * approximate or exact
     * @type {int}
     * @default 1
     */
    this.timepoint = provided(optional.timepoint, StopTime.TIMEPOINT_EXACT);

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



// ==== STOP TIME TIMEPOINTS ==== //

/**
 * Timepoint: Times are considered approximate
 * @const {number}
 * @default 0
 */
StopTime.TIMEPOINT_APPROXIMATE = 0;

/**
 * Timepoint: Times are considered exact
 * @const {number}
 * @default
 */
StopTime.TIMEPOINT_EXACT = 1;



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
