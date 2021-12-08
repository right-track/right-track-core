'use strict';

/**
 * ### Right Track Abstract Classes
 * These modules provide the abstract Right Track Classes used by modules 
 * implementing these data types
 * @module classes
 */

 module.exports = {

  /**
   * Right Track DB Abstract Class
   * @see RightTrackDB
   */
  RightTrackDB: require('./RightTrackDB'),

  /**
   * Right Track Transit Agency Abstract Class
   * @see RightTrackTransitAgency
   */
  RightTrackTransitAgency: require('./RightTrackTransitAgency')

 }