'use strict';

/**
 * GTFS Trip Class
 * @see {@link Trip}
 * @module gtfs/Trip
 */

const provided = require('../utils/provided.js');
const StopTime = require('./StopTime.js');

/**
 * GTFS Trip
 * ---------
 * Representation of the GTS Trip definition
 *
 * GTFS Required Fields:
 * - Trip ID
 * - Route
 * - Service
 * - List of StopTimes
 *
 * GTFS Optional Fields:
 * - Trip Headsign
 * - Trip Short Name
 * - Trip Direction ID
 * - Trip Block ID
 * - Trip Shape ID
 * - Trip Wheelchair Accessibility
 * - Trip Bikes Allowed
 *
 * Right Track Fields:
 * - Trip Direction Description
 * - Trip Peak Indicator
 *
 * **Module:** {@link module:gtfs/Trip|gtfs/Trip}
 *
 * @see {@link https://developers.google.com/transit/gtfs/reference/trips-file|GTFS Spec}
 * @class
 * @alias Trip
 */
class Trip {

  /**
   * Trip Constructor
   * @constructor
   * @param {string} id Trip ID
   * @param {Route} route Trip Route
   * @param {Service} service Trip Service
   * @param {StopTime[]} stopTimes Trip StopTimes list
   * @param {Object} [optional] Optional Arguments
   * @param {string} [optional.headsign] Trip Headsign
   * @param {string} [optional.shortName] Trip Short Name
   * @param {int} [optional.directionId=-1] Trip Direction ID
   * @param {string} [optional.directionDescription] Trip Direction Description
   * @param {int} [optional.blockId] Trip Block ID
   * @param {int} [optional.shapeId] Trip Shape ID
   * @param {int} [optional.wheelchairAccessible=0] Trip Wheelchair Accessibility code
   * @param {int} [optional.bikesAllowed=0] Trip Bikes Allowed code
   * @param {boolean} [optional.peak] Trip Peak Status
   */
  constructor(id, route, service, stopTimes, optional={}) {

    /**
     * A unique ID representing the Trip
     * @type {string}
     */
    this.id = id;

    /**
     * The Trip's parent Route
     * @type {Route}
     */
    this.route = route;

    /**
     * The Service the Trip operates on
     * @type {Service}
     */
    this.service = service;

    /**
     * List of scheduled StopTimes for the Trip
     * @type {StopTime[]}
     */
    this.stopTimes = stopTimes;

    /**
     * Trip Headsign - text displayed to passengers indicating the Trip's destination
     * @type {string}
     */
    this.headsign = provided(optional.headsign);

    /**
     * Publicly-viewable Trip ID or name
     * @type {string}
     */
    this.shortName = provided(optional.shortName, this.id);

    /**
     * Direction of travel for the Trip
     * @type {int}
     * @default -1
     */
    this.directionId = provided(optional.directionId, -1);

    /**
     * A description of the Trip's direction
     * @type {string}
     */
    this.directionDescription = provided(optional.directionDescription, "Unspecified Direction");

    /**
     * The ID of the block the Trip belongs to
     * @type {string}
     */
    this.blockId = provided(optional.blockId);

    /**
     * The ID of the shape the Trip belongs to
     * @type {string}
     */
    this.shapeId = provided(optional.shapeId);

    /**
     * Value indicating the wheelchair accessibility of the vehicle
     * making the Trip
     * @type {int}
     * @default 0
     */
    this.wheelchairAccessible = provided(optional.wheelchairAccessible, Trip.WHEELCHAIR_ACCESSIBLE_UNKNOWN);

    /**
     * Value indicating whether bikes are allowed on the vehicle making the Trip
     * @type {int}
     * @default 0
     */
    this.bikesAllowed = provided(optional.bikesAllowed, Trip.BIKES_ALLOWED_UNKNOWN);

    /**
     * Value indicating the peak status of the Trip.
     * @type {boolean}
     * @default false
     */
    this.peak = provided(optional.peak, false);

    // Sort stoptimes by stop sequence
    this.stopTimes.sort(StopTime.sortByStopSequence);

  }


  /**
   * Get the StopTime associated with the specified Stop
   * @param {Stop|String} stop Stop (or Stop ID) to find in Trip's list of StopTimes
   * @returns {StopTime} matching StopTime
   */
  getStopTime(stop) {
    if ( typeof stop === 'object' ) {
      stop = stop.id;
    }
    for ( let i = 0; i < this.stopTimes.length; i++ ) {
      let stopTime = this.stopTimes[i];
      if ( this.stopTimes[i].stop.id === stop ) {
        return this.stopTimes[i];
      }
    }
  }

  /**
   * Check if the Trip's list of StopTimes includes the specified Stop
   * @param {Stop|String} stop Stop (or Stop ID) to check for
   * @returns {boolean} true if the Stop is found in list of StopTimes
   */
  hasStopTime(stop) {
    if ( typeof stop === 'object' ) {
      stop = stop.id;
    }
    for ( let i = 0; i < this.stopTimes.length; i++ ) {
      if ( this.stopTimes[i].stop.id === stop ) {
        return true;
      }
    }
    return false;
  }

}


// ==== WHEELCHAIR ACCESSIBILITY CODES ==== //

/**
 * Trip Wheelchair Accessibility: Unknown
 * @const {number}
 * @default 0
 */
Trip.WHEELCHAIR_ACCESSIBLE_UNKNOWN = 0;

/**
 * Trip Wheelchair Accessibility: Accessible
 * @const {number}
 * @default
 */
Trip.WHEELCHAIR_ACCESSIBLE_YES = 1;

/**
 * Trip Wheelchair Accessibility: Inaccessible
 * @const {number}
 * @default
 */
Trip.WHEELCHAIR_ACCESSIBLE_N0 = 2;



// ==== BIKES ALLOWED CODES ==== //

/**
 * Trip Bikes Allowed: Unknown
 * @const {number}
 * @default 0
 */
Trip.BIKES_ALLOWED_UNKNOWN = 0;

/**
 * Trip Bikes Allowed: At least one allowed
 * @const {number}
 * @default
 */
Trip.BIKES_ALLOWED_YES = 1;

/**
 * Trip Bikes Allowed: No bikes allowed
 * @const {number}
 * @default
 */
Trip.BIKES_ALLOWED_NO = 2;




// ==== SORT METHODS ==== //

/**
 * Sort Trips by departure time of the first Stop (or reference Stop, if defined)
 * @param {Trip} a first Trip
 * @param {Trip} b second Trip
 * @returns {number} compare integer
 */
Trip.sortByDepartureTime = function(a, b) {
  if ( a._referenceStopId && b._referenceStopId && a._referenceStopId === b._referenceStopId ) {
    let stopId = a._referenceStopId;
    if ( a.getStopTime(stopId).departure.toTimestamp() < b.getStopTime(stopId).departure.toTimestamp() ) {
      return -1;
    }
    else if ( a.getStopTime(stopId).departure.toTimestamp() > b.getStopTime(stopId).departure.toTimestamp() ) {
      return 1;
    }
    else {
      return 0;
    }
  }
  else {
    if ( a.stopTimes[0].departure.toTimestamp() < b.stopTimes[0].departure.toTimestamp() ) {
      return -1;
    }
    else if ( a.stopTimes[0].departure.toTimestamp() > b.stopTimes[0].departure.toTimestamp() ) {
      return 1;
    }
    else {
      return 0;
    }
  }
};


module.exports = Trip;