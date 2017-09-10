'use strict';

/**
 * GTFS Route
 * ----------
 * Representation of the GTFS Route definition.
 *
 * GTFS Required Fields:
 * - Route ID
 * - Route Short Name
 * - Route Long Name
 * - Route Type
 *
 * GTFS Optional Fields:
 * - GTFS Agency
 * - Route Color
 * - Route Text Color
 *
 * @see {@link https://developers.google.com/transit/gtfs/reference/routes-file|GTFS Spec}
 * @class
 */
class Route {

    /**
     * Route Constructor
     * @constructor
     * @param {string} id Route ID
     * @param {string} shortName Route Short Name
     * @param {string} longName Route Long Name
     * @param {int} type Route Type
     * @param {Agency=} agency Route Parent Agency
     * @param {string=} color Route Color
     * @param {string=} textColor Route Text Color
     */
    constructor(id, shortName, longName, type,
                agency=undefined, color="#ffffff", textColor="#000000") {
        this.id = id;
        this.shortName = shortName;
        this.longName = longName;
        this.type = type;
        this.agency = agency;
        this.color = color;
        this.textColor = textColor;
    }
    
}



// ==== ROUTE TYPE DEFINITIONS ==== //

/**
 * Route Type: Light Rail
 * @type {number}
 */
Route.ROUTE_TYPE_LIGHT_RAIL = 0;

/**
 * Route Type: Subway
 * @type {number}
 */
Route.ROUTE_TYPE_SUBWAY = 1;

/**
 * Route Type: Rail
 * @type {number}
 */
Route.ROUTE_TYPE_RAIL = 2;

/**
 * Route Type: Bus
 * @type {number}
 */
Route.ROUTE_TYPE_BUS = 3;

/**
 * Route Type: Ferry
 * @type {number}
 */
Route.ROUTE_TYPE_FERRY = 4;

/**
 * Route Type: Cable Car
 * @type {number}
 */
Route.ROUTE_TYPE_CABLE_CAR = 5;

/**
 * Route Type: Gondola
 * @type {number}
 */
Route.ROUTE_TYPE_GONDOLA = 6;

/**
 * Route Type: Funicular
 * @type {number}
 */
Route.ROUTE_TYPE_FUNICULAR = 7;


module.exports = Route;
