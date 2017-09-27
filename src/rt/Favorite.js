'use strict';

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
 * ## Station
 *
 * **Parameters:**
 * ```
 *  {
 *      stop: {
 *          id: 'Stop ID',
 *          statusId: 'Stop Status ID',
 *          name: 'Stop Name'
 *      }
 *  }
 *  ```
 *
 *  **Options:**
 *
 *  Currently, there are no options for a Favorite Station.
 *
 *
 * ## Trip
 *
 * **Parameters:**
 * ```
 *  {
 *      origin: {
 *          id: 'Stop ID'
 *          statusId: 'Stop Status ID',
 *          name: 'Stop Name'
 *      },
 *      destination: {
 *          id 'Stop ID'
 *          statusId: 'Stop Status ID',
 *          name: 'Stop Name'
 *      }
 *  }
 *  ```
 *
 *  **Options:**
 *  ```
 *  {
 *      allowTransfers: true
 *  }
 *  ```
 *
 * **package:** core.rt.Favorite
 */
class Favorite {

    /**
     * Create a new Favorite with the specified information
     * @param {int} type Favorite Type
     * @param {int} sequence Favorite Sequence (1, 2, etc...)
     * @param {object} parameters Favorite Parameters
     * @param {object=} options Favorite Options
     */
    constructor(type, sequence, parameters, options={}) {
        this.type = type;
        this.sequence = sequence;
        this.parameters = parameters;
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

/** Favorite Type: Station */
Favorite.FAVORITE_TYPE_STATION = 1;

/** Favorite Type: Trip */
Favorite.FAVORITE_TYPE_TRIP = 2;



// ==== FACTORY METHODS ==== //

/**
 * Favorite Factory: create a Favorite Station
 * @param {Stop} stop The Stop to save as a Favorite Station
 * @param {int} sequence The Favorite sequence
 * @param {object=} opts={} Station Options
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
 * @param {object=} opts={} Trip Options
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


module.exports = Favorite;