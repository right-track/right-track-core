'use strict';

/**
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
 * @see {@link https://developers.google.com/transit/gtfs/reference/stops_times-file|GTFS Spec}
 * @class
 */
class StopTime {

  /**
   * StopTime Constructor
   * @constructor
   * @param {Stop} stop StopTime Stop
   * @param {string} arrivalTime StopTime Arrival Time (GTFS Time String)
   * @param {string} departureTime StopTime Departure Time (GTFS Time String)
   * @param {int} stopSequence StopTime Stop Sequence
   * @param {int=} arrivalTimeSeconds StopTime Arrival Time (Time Seconds)
   * @param {int=} departureTimeSeconds StopTime Departure Time (Time Seconds)
   * @param {int=} pickupType StopTime Pickup Type
   * @param {int=} dropOffType StopTime Drop Off Type
   * @param {int=} date StopTime date (yyyymmdd)
   */
  constructor(stop, arrivalTime, departureTime, stopSequence,
              arrivalTimeSeconds, departureTimeSeconds, pickupType=StopTime.PICKUP_TYPE_REGULAR,
              dropOffType=StopTime.DROP_OFF_TYPE_REGULAR, date=19700101) {

    this.stop = stop;
    this.arrivalTime = arrivalTime;
    this.departureTime = departureTime;
    this.stopSequence = stopSequence;
    this.arrivalTimeSeconds = (typeof arrivalTimeSeconds !== 'undefined')
      ? arrivalTimeSeconds
      : new DateTime(arrivalTime, date).getTimeSeconds();
    this.departureTimeSeconds = (typeof departureTimeSeconds !== 'undefined')
      ? departureTimeSeconds
      : new DateTime(departureTime, date).getTimeSeconds();
    this.pickupType = pickupType;
    this.dropOffType = dropOffType;
    this.date = date;

  }

}


// ==== STOPTIME PICKUP TYPES ==== //

/**
 * Pickup Type: Regularly scheduled pickup
 * @type {number}
 */
StopTime.PICKUP_TYPE_REGULAR = 0;

/**
 * Pickup Type: No pickup available
 * @type {number}
 */
StopTime.PICKUP_TYPE_NONE = 1;

/**
 * Pickup Type: Phone agency to arrange
 * @type {number}
 */
StopTime.PICKUP_TYPE_PHONE_AGENCY = 2;

/**
 * Pickup Type: Coordinate with driver
 * @type {number}
 */
StopTime.PICKUP_TYPE_DRIVER_COORDINATION = 3;



// ==== STOPTIME DROP OFF TYPE ==== //

/**
 * Drop Off Type: Regularly scheduled drop off
 * @type {number}
 */
StopTime.DROP_OFF_TYPE_REGULAR = 0;

/**
 * Drop Off Type: No drop off available
 * @type {number}
 */
StopTime.DROP_OFF_TYPE_NONE = 1;

/**
 * Drop Off Type: Phone agency to arrange
 * @type {number}
 */
StopTime.DROP_OFF_TYPE_PHONE_AGENCY = 2;

/**
 * Drop Off Type: Coordinate with driver
 * @type {number}
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
