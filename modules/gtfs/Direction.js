'use strict';

/**
 * GTFS Direction Class
 * @see {@link Direction}
 * @module gtfs/Direction
 */

/**
 * GTFS Direction
 * --------------
 * Representation of the GTFS Direction definition.
 *
 * GTFS Required Fields:
 * - GTFS Direction ID
 * - GTFS Direction Description
 *
 * **Module:** {@link module:gtfs/Direction|gtfs/Direction}
 *
 * @class
 * @alias Direction
 */
 class Direction {

    /**
     * GTFS Direction Constructor
     * @constructor
     * @param {string} id Direction ID
     * @param {string} description Direction Description
     */
    constructor(id, description) {

        /**
         * The unique ID representing the Direction
         * @type {string}
         */
        this.id = id;

        /**
         * The human-readable description of the Direction
         * @type {string}
         */
        this.description = description;

    }
 }


 module.exports = Direction;