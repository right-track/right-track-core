'use strict';

/**
 * Right Track Favorite Class
 * @see {@link Favorite}
 * @module rt/Favorite
 */

/**
 * RT Favorite
 * -----------
 * Representation of a Right Track User Favorite.  This can be a
 * saved Station or Trip with the associated parameters and
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
 *      statusId: 'Stop Status ID',
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
 *      statusId: 'Stop Status ID',
 *      name: 'Stop Name'
 *    },
 *    destination: {
 *      id 'Stop ID'
 *      statusId: 'Stop Status ID',
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
   * @param {Favorite~FavoriteStationParameters|Favorite~FavoriteTripParameters} parameters Favorite Parameters
   * @param {Favorite~FavoriteStationOptions|Favorite~FavoriteTripOptions} [options={}] Favorite Options
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
     * @type {Favorite~FavoriteStationParameters|Favorite~FavoriteTripParameters}
     */
    this.parameters = parameters;

    /**
     * The Favorite's Options
     * @type {Favorite~FavoriteStationOptions|Favorite~FavoriteTripOptions}
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



// ==== FACTORY METHODS ==== //

/**
 * Favorite Factory: create a Favorite Station
 * @param {Stop} stop The Stop to save as a Favorite Station
 * @param {int} sequence The Favorite sequence
 * @param {Favorite~FavoriteStationOptions} [opts={}] Station Options
 * @returns {Favorite} Favorite Station
 */
Favorite.createStation = function(stop, sequence, opts={}) {
  return new Favorite(
    Favorite.FAVORITE_TYPE_STATION,
    sequence,
    {
      stop: {
        id: stop.id,
        statusId: stop.statusId,
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
 * @param {Favorite~FavoriteTripOptions} [opts={}] Trip Options
 * @returns {Favorite} Favorite Trip
 */
Favorite.createTrip = function(origin, destination, sequence, opts={}) {
  return new Favorite(
    Favorite.FAVORITE_TYPE_TRIP,
    sequence,
    {
      origin: {
        id: origin.id,
        statusId: origin.statusId,
        name: origin.name
      },
      destination: {
        id: destination.id,
        statusId: destination.statusId,
        name: destination.name
      }
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
 * @property stop The Favorite Station
 * @property stop.id Stop Id
 * @property stop.statusId Stop Status Id
 * @property stop.name Stop Name
 */

/**
 * The Options for a Favorite Station
 * @typedef {Object} Favorite~FavoriteStationOptions
 */

/**
 * The Parameters for a Favorite Trip
 * @typedef {Object} Favorite~FavoriteTripParameters
 * @property origin The Origin Stop
 * @property origin.id Origin Id
 * @property origin.statusId Origin Status Id
 * @property origin.name Origin Name
 * @property destination The Destination Stop
 * @property destination.id Destination Id
 * @property destination.statusId Destination Status Id
 * @property destination.name Destination Name
 */

/**
 * The Options for a Favorite Trip
 * @typedef {Object} Favorite~FavoriteTripOptions
 * @property {boolean} allowTransfers Allow the Trip Result to include transfers
 */



module.exports = Favorite;