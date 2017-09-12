'use strict';

const StopTime = require("./StopTime.js");

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
 * **package:** core.gtfs.Trip
 *
 * @see {@link https://developers.google.com/transit/gtfs/reference/trips-file|GTFS Spec}
 * @class
 */
class Trip {

    /**
     * Trip Constructor
     * @constructor
     * @param {string} id Trip ID
     * @param {Route} route Trip Route
     * @param {Service} service Trip Service
     * @param {StopTime[]} stopTimes Trip StopTimes list
     * @param {string=} shortName Trip Short Name
     * @param {int=} directionId Trip Direction ID
     * @param {int=} wheelchairAccessible Trip Wheelchair Accessibility code
     * @param {string=} directionDescription Trip Direction Description
     */
    constructor(id, route, service, stopTimes,
                shortName="", directionId=-1, wheelchairAccessible=Trip.WHEELCHAIR_ACCESSIBLE_UNKNOWN,
                directionDescription="") {
        this.id = id;
        this.route = route;
        this.service = service;
        this._stopTimes = stopTimes;
        this.shortName = shortName;
        this.directionId = directionId;
        this.wheelchairAccessible = wheelchairAccessible;
        this.directionDescription = directionDescription;
    }

    /**
     * Get the list of StopTimes (sorted by stop sequence) for this Trip
     * @returns {StopTime[]} List of StopTimes sorted by stop sequence
     */
    get stopTimes() {
        this._stopTimes.sort(StopTime.sortByStopSequence);
        return this._stopTimes;
    }

    /**
     * Get the StopTime associated with the specified Stop
     * @param {Stop} stop Stop to find in Trip's list of StopTimes
     * @returns {StopTime} matching StopTime
     */
    getStopTime(stop) {
        for ( let i = 0; i < this._stopTimes.length; i++ ) {
            let stopTime = this._stopTimes[i];
            if ( stopTime.stop.id === stop.id ) {
                return stopTime;
            }
        }
    }

    /**
     * Check if the Trip's list of StopTimes includes the specified Stop
     * @param {Stop} stop Stop to check for
     * @returns {boolean} true if the Stop is found in list of StopTimes
     */
    hasStopTime(stop) {
        for ( let i = 0; i < this._stopTimes.length; i++ ) {
            let stopTime = this._stopTimes[i];
            if ( stopTime.stop.id === stop.id ) {
                return true;
            }
        }
        return false;
    }

}


// ==== WHEELCHAIR ACCESSIBILITY CODES ==== //

/**
 * Trip Wheelchair Accessibility: Unknown
 * @type {number}
 */
Trip.WHEELCHAIR_ACCESSIBLE_UNKNOWN = 0;

/**
 * Trip Wheelchair Accessibility: Accessible
 * @type {number}
 */
Trip.WHEELCHAIR_ACCESSIBLE_YES = 1;

/**
 * Trip Wheelchair Accessibility: Inaccessible
 * @type {number}
 */
Trip.WHEELCHAIR_ACCESSIBLE_N0 = 2;


module.exports = Trip;