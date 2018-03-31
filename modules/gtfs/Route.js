'use strict';

const provided = require('../utils/provided.js');

/**
 * GTFS Route Class
 * @see {@link Route}
 * @module gtfs/Route
 */

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
 * - Route Agency
 * - Route Description
 * - Route URL
 * - Route Color
 * - Route Text Color
 * - Route Sort Order
 *
 * **Module:** {@link module:gtfs/Route|gtfs/Route}
 *
 * @see {@link https://developers.google.com/transit/gtfs/reference/routes-file|GTFS Spec}
 * @class
 * @alias Route
 */
class Route {

  /**
   * Route Constructor
   * @constructor
   * @param {string} id Route ID
   * @param {string} shortName Route Short Name
   * @param {string} longName Route Long Name
   * @param {int} type Route Type
   * @param {Object} [optional] Optional Arguments
   * @param {Agency} [optional.agency] Route Agency
   * @param {string} [optional.description] Route Description
   * @param {string} [optional.url] Route Website URL
   * @param {string} [optional.color=ffffff] Route Color
   * @param {string} [optional.textColor=000000] Route Text Color
   * @param {int} [optional.sortOrder] Route Sort Order
   */
  constructor(id, shortName, longName, type, optional={}) {

    /**
     * Unique ID that identifies a route
     * @type {String}
     */
    this.id = id;

    /**
     * The short name of a route
     * @type {string}
     */
    this.shortName = shortName;

    /**
     * The full name of a route
     * @type {string}
     */
    this.longName = longName;

    /**
     * The type of transportation used on a route
     * @type {int}
     */
    this.type = type;

    /**
     * The parent Agency of the route
     * @type {Agency}
     */
    this.agency = provided(optional.agency);

    /**
     * Description of the Route
     * @type {string}
     */
    this.description = provided(optional.description);

    /**
     * Route website URL
     * @type {string}
     */
    this.url = provided(optional.url);

    /**
     * The color that corresponds to the route and represented as
     * a six-figure hexadecimal number (without the leading '#')
     * @type {string}
     * @default ffffff
     */
    this.color = provided(optional.color, 'a9a9a9');

    /**
     * The text color that corresponds to the route's color as a
     * six-figure hexadecimal number (without the leading '#')
     * @type {string}
     * @default 000000
     */
    this.textColor = provided(optional.textColor, '000000');

    /**
     * Field used for sorting the display of Routes
     * @type {int}
     */
    this.sortOrder = provided(optional.sortOrder);

  }

}



// ==== ROUTE TYPE DEFINITIONS ==== //

/**
 * Route Type: Light Rail
 * @const {number}
 * @default 0
 */
Route.ROUTE_TYPE_LIGHT_RAIL = 0;

/**
 * Route Type: Subway
 * @const {number}
 * @default
 */
Route.ROUTE_TYPE_SUBWAY = 1;

/**
 * Route Type: Rail
 * @const {number}
 * @default
 */
Route.ROUTE_TYPE_RAIL = 2;

/**
 * Route Type: Bus
 * @const {number}
 * @default
 */
Route.ROUTE_TYPE_BUS = 3;

/**
 * Route Type: Ferry
 * @const {number}
 * @default
 */
Route.ROUTE_TYPE_FERRY = 4;

/**
 * Route Type: Cable Car
 * @const {number}
 * @default
 */
Route.ROUTE_TYPE_CABLE_CAR = 5;

/**
 * Route Type: Gondola
 * @const {number}
 * @default
 */
Route.ROUTE_TYPE_GONDOLA = 6;

/**
 * Route Type: Funicular
 * @const {number}
 * @default
 */
Route.ROUTE_TYPE_FUNICULAR = 7;



// ==== SORT FUNCTIONS ==== //

/**
 * Sort Route by Name (ascending)
 * @param {Route} a first Route
 * @param {Route} b second Route
 * @returns {number} compare integer
 */
Route.sortByName = function(a, b) {
  if ( a.longName < b.longName ) {
    return -1;
  }
  else if ( a.longName > b.longName ) {
    return 1;
  }
  else {
    return 0;
  }
};


module.exports = Route;
