'use strict';

const DateTime = require('../../../utils/DateTime');

/**
 * Vehicle Feed Position
 * ---------------------
 * Real-time position information for a specific Vehicle.  Used 
 * by the `VehicleFeed` Class.
 * 
 * To access this Class directly:
 * ```javascript
 * const core = require('right-track-core');
 * const VF = core.classes.VehicleFeed;
 * const VehicleFeedPosition = VF.VehicleFeedPosition;
 * ```
 * 
 * @class
 * @alias VehicleFeedPosition
 */
class VehicleFeedPosition {

    /**
     * Vehicle Feed Position Constructor
     * @constructor
     * @param {number} lat The most recent vehicle latitude
     * @param {number} lon The most recent vehicle longitude
     * @param {String} [description] The description of the real-time position (ie, "in transit to {next stop}")
     * @param {DateTime} updated The Date/Time of when the position was last updated
     * @param {Object} [properties] Additional vehicle position properties
     * @param {number} [properties.bearing] The most recent vehicle bearing
     * @param {number} [properties.speed] The most recent vehicle speed, in m/s
     * @param {string} [properties.status] The current status of the vehicle
     * @param {Stop} [properties.stop] The Stop referenced by the status
     */
    constructor(lat, lon, description, updated, properties) {

        // Parse arguments
        if ( !properties && !updated ) {
            updated = description;
            description = undefined;
        }
        else if ( !properties ) {
            if ( typeof updated === 'object' && !(updated instanceof DateTime) ) {
                properties = updated;
                updated = description;
                description = undefined;
            }
        }

        /**
         * The most recent vehicle latitude
         * @type {number}
         */
        this.lat = lat;

        /**
         * The most recent vehicle longitude
         * @type {number}
         */
        this.lon = lon;

        /**
         * The description of the Vehicle's position
         * @type {string}
         */
        this.description = description;

        /**
         * The Date/Time of when the position was last updated
         * @type {DateTime}
         */
        this.updated = updated;

        /**
         * The most recent vehicle bearing
         * @type {number}
         * @optional
         */
        this.bearing = properties?.bearing;

        /**
         * The most recent vehicle speed, in m/s
         * @type {number}
         * @optional
         */
        this.speed = properties?.speed;

        /**
         * The current status of the vehicle
         * @type {VehicleFeedPosition.VehicleStatus}
         * @optional
         */
        this.status = properties?.status;

        /**
         * The Stop referenced by the status
         * @type {Stop}
         * @optional
         */
        this.stop = properties?.stop;

    }

}


/**
 * The current vehicle status
 * @readonly
 * @enum {string}
 * @alias VehicleFeedPosition.VehicleStatus
 */
VehicleFeedPosition.VEHICLE_STATUS = {

    /**
     * The vehicle is in transit to the referenced Stop
     */
    IN_TRANSIT_TO: "IN_TRANSIT_TO",

    /**
     * The vehicle is approaching the referenced Stop
     */
    INCOMING_AT: "INCOMING_AT",

    /**
     * The vehicle is stopped at the referenced Stop
     */
    STOPPED_AT: "STOPPED_AT"

}



module.exports = VehicleFeedPosition;