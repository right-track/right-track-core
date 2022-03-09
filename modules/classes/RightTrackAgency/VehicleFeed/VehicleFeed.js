'use strict';

/**
 * Vehicle Feed
 * ----------------
 * Information about the real-time postions of a vehicle
 * 
 * To access this Class directly:
 * ```javascript
 * const core = require('right-track-core');
 * const VF = core.classes.VehicleFeed;
 * const VehicleFeed = VP.VehicleFeed;
 * ```
 * 
 * @class
 * @alias VehicleFeed
 */

class VehicleFeed {

    /**
     * Vehicle Feed Constructor
     * @constructor
     * @param {string} id The ID of the vehicle
     * @param {VehicleFeedPosition} position The most recent position of the vehicle
     * @param {Object} [properties] Additional properties of the vehicle
     * @param {StopTime[]} [properties.stops] List of remaining Stops with arrival/departure times made by the vehicle
     * @param {Trip} [properties.trip] The Trip the vehicle is operating
     */
    constructor(id, position, properties) {

        /**
         * The ID of the Vehicle
         * @type {string}
         */
        this.id = id;

        /**
         * The most-recent position of the Vehicle
         * @type {VehicleFeedPosition}
         */
        this.position = position;

        /**
         * List of remaining stops mabe by the vehicle, along with 
         * the departure time(s) from the stop(s)
         * @type {VehicleFeedStop[]}
         * @optional
         */
        this.stops = properties?.stops;

        /**
         * The Trip the vehicle is operating
         * @type {Trip}
         * @optional
         */
         this.trip = properties?.trip;

    }

}


module.exports = VehicleFeed;