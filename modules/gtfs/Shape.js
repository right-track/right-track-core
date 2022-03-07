'use strict';

/**
 * GTFS Shape Class
 * @see {@link Shape}
 * @module gtfs/Shape
 */

const provided = require('../utils/provided.js');

/**
 * GTFS Shape
 * ----------
 * Representation of the GTFS Shape data
 * 
 * GTFS Required Fields:
 * - Shape ID
 * - Shape Point Latitude
 * - Shape Point Longitude
 * - Shape Point Sequence
 * 
 * GTFS Optional Fields:
 * - Shape Distance Traveled
 * 
 * **Module:** {@link module:gtfs/Shape|gtfs/Shape}
 * 
 * @see {@link https://developers.google.com/transit/gtfs/reference/shapes-file|GTFS Spec}
 * @class
 * @alias Shape
 */

class Shape {

  /**
   * Shape Constructor
   * @constructor
   * @param {string} id Shape ID
   * @param {number} shapePtLat Shape Point Latitude
   * @param {number} shapePtLon Shape Point Longitude
   * @param {int} shapePtSequence Shape Point Sequence
   * @param {Object} [optional] Optional Arguments
   * @param {number} [optional.shapeDistTraveled] Shape Distance Traveled
   */
  constructor(id, shapePtLat, shapePtLon, shapePtSequence, optional={}) {

    /**
     * The ID of the Shape (referenced in the gtfs_trips table)
     * @type {string}
     */
    this.id = id;

    /**
     * The latitude of a Shape's point
     * @type {number}
     */
    this.shapePtLat = shapePtLat;

    /**
     * The longitude of a Shape's point
     * @type {number}
     */
    this.shapePtLon = shapePtLon;

    /**
     * The sequence of the point along a Shape
     * @type {int}
     */
    this.shapePtSequence = shapePtSequence;

    /**
     * The distance traveled to the point from the start of the Shape
     * @type {number}
     */
    this.shapeDistTraveled = provided(optional.shapeDistTraveled);

  }

}

/**
 * Sort the points of a Shape by their sequence
 * @param {Stop} a first Shape
 * @param {Stop} b second Shape
 * @return {number} compare integer
 */
 Shape.sortBySequence = function(a, b) {
  if ( a.shapePtSequence < b.shapePtSequence ) {
    return -1;
  }
  else if ( a.shapePtSequence > b.shapePtSequence ) {
    return 1;
  }
  else {
    return 0;
  }
};


module.exports = Shape;