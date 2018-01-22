'use strict';

const provided = require('../utils/provided.js');
const calc = require('../utils/calc.js');

/**
 * GTFS Stop Class
 * @see {@link Stop}
 * @module gtfs/Stop
 */

/**
 * GTFS Stop
 * ---------
 * Representation of the GTFS Stop definition.
 *
 * GTFS Required Fields:
 * - GTFS Stop ID
 * - Stop Name (RT display_name when present otherwise GTFS stop_name)
 * - GTFS Stop Lat
 * - GTFS Stop Lon
 *
 * GTFS Optional Fields:
 * - GTFS Stop Code
 * - GTFS Stop Description
 * - GTFS Zone ID
 * - GTFS Stop URL
 * - GTFS Location Type
 * - GTFS Parent Station
 * - GTFS Stop Timezone
 * - GTFS Wheelchair Boarding
 *
 * Right Track Fields:
 * - RT Status ID
 * - RT Transfer Weight
 *
 * **Module:** {@link module:gtfs/Stop|gtfs/Stop}
 *
 * @see {@link https://developers.google.com/transit/gtfs/reference/stops-file|GTFS Spec}
 * @class
 * @alias Stop
 */
class Stop {

  /**
   * GTFS Stop Constructor
   * @constructor
   * @param {string} id Stop ID
   * @param {string} name Stop Name
   * @param {number} lat Stop Latitude
   * @param {number} lon Stop Longitude
   * @param {Object} [optional] Optional Arguments
   * @param {string} [optional.code] Stop Code
   * @param {string} [optional.description] Stop Description
   * @param {string} [optional.zoneId] Stop Zone ID
   * @param {string} [optional.url] Stop Website URL
   * @param {int} [optional.locationType=0] Stop Location Type
   * @param {string} [optional.parentStation] Stop Parent Station
   * @param {string} [optional.timezone] Stop Timezone Code
   * @param {int} [optional.wheelchairBoarding=0] Stop Wheelchair Boarding
   * @param {string} [optional.statusId='-1'] Right Track Stop Status ID
   * @param {int} [optional.transferWeight=1] Right Track Stop Transfer Weight
   */
  constructor(id, name, lat, lon, optional={}) {

    /**
     * The unique ID representing the Stop
     * @type {string}
     */
    this.id = id;

    /**
     * The name of the Stop
     * @type {string}
     */
    this.name = name;

    /**
     * The latitude of the Stop (WGS 84)
     * @type {number}
     */
    this.lat = lat;

    /**
     * The longitude of the Stop (WGS 84)
     * @type {number}
     */
    this.lon = lon;

    /**
     * Stop Code - short text or number that can publicly be used to
     * identify the Stop
     * @type {string}
     */
    this.code = provided(optional.code);

    /**
     * A description of the Stop
     * @type {string}
     */
    this.description = provided(optional.description);

    /**
     * The fare zone of the Stop (used by the fare rules table)
     * @type {string}
     */
    this.zoneId = provided(optional.zoneId);

    /**
     * The fully-qualified, escaped URL of the Stop's web page
     * @type {string}
     */
    this.url = provided(optional.url);

    /**
     * Stop location type (stop, station, or station entrance/exit)
     * @type {int}
     * @default 0
     */
    this.locationType = provided(optional.locationType, Stop.LOCATION_TYPE_STOP);

    /**
     * Stop ID of Parent Station
     * @type {string}
     */
    this.parentStation = provided(optional.parentStation);

    /**
     * The timezone code for the Stop
     * @type {string}
     */
    this.timezone = provided(optional.timezone);

    /**
     * Value indicating whether wheelchair boardings are possible for the Stop
     * @type {Number}
     * @default 0
     */
    this.wheelchairBoarding = provided(optional.wheelchairBoarding, Stop.WHEELCHAIR_BOARDING_UNKNOWN);

    /**
     * The Stop's ID used for real-time status information
     * @type {string}
     * @default -1
     */
    this.statusId = provided(optional.statusId, '-1');

    /**
     * A value indicating the Stop's likely transfer-availability.  A Stop
     * with a higher transfer weight will likely be more suitable as a transfer
     * Stop than one with a lower transfer weight.
     * @type {Number}
     * @default 1
     */
    this.transferWeight = provided(optional.transferWeight, 1);

    /**
     * The distance (in miles) from the location set by setDistance()
     * @type {undefined|number}
     */
    this.distance = undefined;

  }

  /**
   * Set the Stop's distance property to the distance from the specified
   * location.
   * @param {number} lat Location's latitude (decimal degrees)
   * @param {number} lon Location's longitude (decimal degrees)
   */
  setDistance(lat, lon) {
    this.distance = calc.distance(this.lat, this.lon, lat, lon);
  }

}


// ==== STOP LOCATION TYPES ==== //

/**
 * Location Type: Stop - passengers board or disembark from a transit vehicle
 * @const {number}
 * @default 0
 */
Stop.LOCATION_TYPE_STOP = 0;

/**
 * Location Type: Station - physical structure or area that contains one or more Stops
 * @const {number}
 * @default
 */
Stop.LOCATION_TYPE_STATION = 1;

/**
 * Location Type: Station Entrance/Exit - location where passengers enter or exit a Station
 * @const {number}
 * @default
 */
Stop.LOCATION_TYPE_ENTRANCE_EXIT = 2;



// ==== WHEELCHAIR BOARDING CODES ==== //

/**
 * Wheelchair Boarding: info unknown
 * @const {number}
 * @default 0
 */
Stop.WHEELCHAIR_BOARDING_UNKNOWN = 0;

/**
 * Wheelchair Boarding: possible
 * @const {number}
 * @default
 */
Stop.WHEELCHAIR_BOARDING_YES = 1;

/**
 * Wheelchair Boarding: impossible
 * @const {number}
 * @default
 */
Stop.WHEELCHAIR_BOARDING_NO = 2;



// ==== SORT FUNCTIONS ==== //

/**
 * Sort Stops by ID (ascending)
 * @param {Stop} a first Stop
 * @param {Stop} b second Stop
 * @return {number} compare integer
 */
Stop.sortById = function(a, b) {
  if ( a.id < b.id ) {
    return -1;
  }
  else if ( a.id > b.id ) {
    return 1;
  }
  else {
    return 0;
  }
};

/**
 * Sort Stops by Name (ascending)
 * @param {Stop} a first Stop
 * @param {Stop} b second Stop
 * @returns {number} compare integer
 */
Stop.sortByName = function(a, b) {
  if ( a.name < b.name ) {
    return -1;
  }
  else if ( a.name > b.name ) {
    return 1;
  }
  else {
    return 0;
  }
};

/**
 * Sort Stops by Transfer Weight (descending)
 * @param {Stop} a first Stop
 * @param {Stop} b second Stop
 * @returns {number} compare integer
 */
Stop.sortByTransferWeight = function(a, b) {
  if ( a.transferWeight > b.transferWeight ) {
    return -1;
  }
  else if ( a.transferWeight < b.transferWeight ) {
    return 1;
  }
  else {
    return 0;
  }
};


/**
 * Sort Stops by Distance (if set)
 * @param {Stop} a first Stop
 * @param {Stop} b second Stop
 * @returns {number} compare integer
 */
Stop.sortByDistance = function(a, b) {
  if ( a.distance !== undefined && b.distance !== undefined ) {
    if ( a.distance < b.distance ) {
      return -1;
    }
    else if ( a.distance > b.distance ) {
      return 1;
    }
  }
  return 0;
};



module.exports = Stop;
