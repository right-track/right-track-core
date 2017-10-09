'use strict';

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
 * - GTFS Stop URL
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
   * @param {string} [url] Stop URL
   * @param {int} [wheelchairBoarding] Stop Wheelchair Boarding
   * @param {string} [statusId] Right Track Stop Status ID
   * @param {int} [transferWeight] Right Track Stop Transfer Weight
   */
  constructor(id, name, lat, lon,
              url='', wheelchairBoarding=Stop.WHEELCHAIR_BOARDING_UNKNOWN, statusId='-1', transferWeight=1) {
    this.id = id;
    this.name = name;
    this.lat = lat;
    this.lon = lon;
    this.url = url;
    this.wheelchairBoarding = wheelchairBoarding;
    this.statusId = statusId;
    this.transferWeight = transferWeight;
  }


}



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



module.exports = Stop;
