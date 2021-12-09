'use strict';

const TransitAgency = require('../classes/RightTrackTransitAgency');
const TransitDivision = require('../classes/RightTrackTransitAgency/TransitFeed/TransitDivision');

/**
 * Right Track Favorite Class
 * @see {@link Favorite}
 * @module rt/Favorite
 */

/**
 * RT Favorite
 * -----------
 * Representation of a Right Track User Favorite.  This can be a
 * saved Station, Trip or Train with the associated parameters and
 * optional options.
 *
 * The following describes the format for the Favorite parameters
 * and options.
 *
 *
 * ### Station
 *
 * **Parameters:**
 * ```
 *  {
 *    stop: {
 *      id: 'Stop ID',
 *      name: 'Stop Name'
 *    }
 *  }
 *  ```
 *
 *  **Options:**
 *
 *  Currently, there are no options for a Favorite Station.
 *
 *
 * ### Trip
 *
 * **Parameters:**
 * ```
 *  {
 *    origin: {
 *      id: 'Stop ID'
 *      name: 'Stop Name'
 *    },
 *    destination: {
 *      id 'Stop ID'
 *      name: 'Stop Name'
 *    }
 *  }
 *  ```
 *
 *  **Options:**
 *  ```
 *  {
 *    allowTransfers: true
 *  }
 *  ```
 * 
 * ### Transit
 *
 * **Parameters:**
 * ```
 *  {
 *    agency: {
 *      id: 'Transit Agency ID',
 *      name: 'Transit Name'
 *    },
 *    division: {
 *      code: 'Transit Division Code',
 *      name: 'Transit Division Name'
 *    },
 *    divisionCodes: ['subway', 'A']
 *  }
 *  ```
 *
 *  **Options:**
 *
 *  Currently, there are no options for a Favorite Transit.
 *
 * **Module:** {@link module:rt/Favorite|rt/Favorite}
 *
 * @class
 * @alias Favorite
 */
class Favorite {

  /**
   * Create a new Favorite with the specified information
   * @param {int} type Favorite Type
   * @param {int} sequence Favorite Sequence (1, 2, etc...)
   * @param {Object} parameters Favorite {@link Favorite~FavoriteStationParameters|Station} or {@link Favorite~FavoriteTripParameters|Trip} or {@link Favorite~FavoriteTransitParameters|Transit} Parameters
   * @param {Object} [options={}] Favorite {@link Favorite~FavoriteStationOptions|Station} or {@link Favorite~FavoriteTripOptions|Trip} or {@link Favorite~FavoriteTransitOptions|Transit} Options
   */
  constructor(type, sequence, parameters, options={}) {

    /**
     * Value indicating the Favorite type
     * @type {int}
     */
    this.type = type;

    /**
     * The sequence of the Favorite in the User's list
     * @type {int}
     */
    this.sequence = sequence;

    /**
     * The Favorite's Parameters
     * @type {Object}
     */
    this.parameters = parameters;

    /**
     * The Favorite's Options
     * @type {Object}
     */
    this.options = options;

  }

  /**
   * Check if the Favorite is a Favorite Station
   * @returns {boolean} true if Station
   */
  isStation() {
    return this.type === Favorite.FAVORITE_TYPE_STATION;
  }

  /**
   * Check if the Favorite is a Favorite Trip
   * @returns {boolean} true if Trip
   */
  isTrip() {
    return this.type === Favorite.FAVORITE_TYPE_TRIP;
  }

  /**
   * Check if the Favorite is a Favorite Transit
   * @returns {boolean} true if Transit
   */
  isTransit() {
    return this.type === Favorite.FAVORITE_TYPE_TRANSIT;
  }

}



// ==== FAVORITE TYPES ==== //

/**
 * Favorite Type: Station
 * @const {number}
 * @default
 */
Favorite.FAVORITE_TYPE_STATION = 1;

/**
 * Favorite Type: Trip
 * @const {number}
 * @default
 */
Favorite.FAVORITE_TYPE_TRIP = 2;

/**
 * Favorite Type: Transit (old)
 * The old transit favorite type (divided into agency / division / line)
 * @const {number}
 * @deprecated
 */
Favorite.FAVORITE_TYPE_TRANSIT_OLD = 3;

/**
 * Favorite Type: Transit
 * The new transit favorite type (divided into agency / divisions...)
 * @const {number}
 * @default
 */
Favorite.FAVORITE_TYPE_TRANSIT = 4;


// ==== FACTORY METHODS ==== //

/**
 * Favorite Factory: create a Favorite Station
 * @param {Stop} stop The Stop to save as a Favorite Station
 * @param {int} sequence The Favorite sequence
 * @param {Object} [opts={}] {@link Favorite~FavoriteStationOptions|Station Options}
 * @returns {Favorite} Favorite Station
 */
Favorite.createStation = function(stop, sequence, opts={}) {
  return new Favorite(
    Favorite.FAVORITE_TYPE_STATION,
    sequence,
    {
      stop: {
        id: stop.id,
        name: stop.name
      }
    },
    opts
  );
};

/**
 * Favorite Factory: create a Favorite Trip
 * @param {Stop} origin The origin of the Favorite Trip
 * @param {Stop} destination The destination of the Favorite Trip
 * @param {int} sequence The Favorite sequence
 * @param {Object} [opts={}] {@link Favorite~FavoriteTripOptions|Trip Options}
 * @returns {Favorite} Favorite Trip
 */
Favorite.createTrip = function(origin, destination, sequence, opts={}) {
  return new Favorite(
    Favorite.FAVORITE_TYPE_TRIP,
    sequence,
    {
      origin: {
        id: origin.id,
        name: origin.name
      },
      destination: {
        id: destination.id,
        name: destination.name
      }
    },
    opts
  )
};

/**
 * Favorite Factory: create a Favorite Transit Agency/Division... 
 * @param {TransitAgency} agency The Transit Agency of the Favorite Transit
 * @param {TransitDivision} division The Transit Division of the Favorite Transit 
 * @param {String[]} divisionCodes The Transit Division codes (codes of parent(s) and favorite)
 * @param {int} sequence The Favorite sequence
 * @param {Object} [opts={}] {@link Favorite~FavoriteTransitOptions|Transit Options}
 * @returns {Favorite} Favorite Transit 
 */
Favorite.createTransit = function(agency, division, divisionCodes, sequence, opts={}) {
  return new Favorite(
    Favorite.FAVORITE_TYPE_TRANSIT,
    sequence,
    {
      agency: {
        id: agency.id,
        name: agency.name
      },
      division: {
        code: division.code,
        name: division.name
      },
      divisionCodes: divisionCodes
    },
    opts
  )
};


// ==== SORT FUNCTIONS ==== //

/**
 * Sort Favorites by sequence (ascending)
 * @param {Favorite} a first Favorite
 * @param {Favorite} b second Favorite
 * @returns {number} compare integer
 */
Favorite.sortBySequence = function(a, b) {
  if ( a.sequence < b.sequence ) {
    return -1;
  }
  else if ( a.sequence > b.sequence ) {
    return 1;
  }
  else {
    return 0;
  }
};



// ==== TYPE DEFINITIONS ==== //

/**
 * The Parameters for a Favorite Station
 * @typedef {Object} Favorite~FavoriteStationParameters
 * @property {Stop} stop The Favorite Station
 * @property {String} stop.id Stop Id
 * @property {String} stop.name Stop Name
 */

/**
 * The Options for a Favorite Station
 * @typedef {Object} Favorite~FavoriteStationOptions
 */

/**
 * The Parameters for a Favorite Trip
 * @typedef {Object} Favorite~FavoriteTripParameters
 * @property {Stop} origin The Origin Stop
 * @property {String} origin.id Origin Id
 * @property {String} origin.name Origin Name
 * @property {Stop} destination The Destination Stop
 * @property {String} destination.id Destination Id
 * @property {String} destination.name Destination Name
 */

/**
 * The Options for a Favorite Trip
 * @typedef {Object} Favorite~FavoriteTripOptions
 * @property {boolean} allowTransfers Allow the Trip Result to include transfers
 */

 /**
  * The Parameters for a Favorite Transit
  * @typedef {Object} Favorite~FavoriteTransitParameters
  * @property {TransitAgency} agency The Transit Agency
  * @property {String} agency.code The Transit Agency code
  * @property {String} agency.name The Transit Agency name
  * @property {TransitDivision} division The Transit Division
  * @property {String} division.code The Transit Division code
  * @property {String} division.name The Transit Division name
  * @property {String[]} divisionCodes The array of Division codes (includes parent(s) and favorite)
  */

/**
 * The Options for a Favorite Transit
 * @typedef {Object} Favorite~FavoriteTransitOptions
 */


module.exports = Favorite;