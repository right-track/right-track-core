'use strict';

/**
 * GTFS Trip Class
 * @see {@link Trip}
 * @module gtfs/Trip
 */

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
 * - Trip Short Name
 * - Trip Direction ID
 * - Trip Wheelchair Accessibility
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
   * @param {string} [shortName] Trip Short Name
   * @param {int} [directionId] Trip Direction ID
   * @param {int} [wheelchairAccessible] Trip Wheelchair Accessibility code
   * @param {string} [directionDescription] Trip Direction Description
   */
  constructor(id, route, service, stopTimes,
              shortName='', directionId=-1, wheelchairAccessible=Trip.WHEELCHAIR_ACCESSIBLE_UNKNOWN,
              directionDescription='') {

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
     * Publicly-viewable Trip ID or name
     * @type {string}
     */
    this.shortName = shortName;

    /**
     * Direction of travel for the Trip
     * @type {int}
     */
    this.directionId = directionId;

    /**
     * Value indicating the wheelchair accessibility of the vehicle
     * making the Trip
     * @type {int}
     */
    this.wheelchairAccessible = wheelchairAccessible;

    /**
     * A description of the Trip's direction
     * @type {string}
     */
    this.directionDescription = directionDescription;

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