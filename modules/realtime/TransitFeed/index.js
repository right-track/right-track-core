'use strict';

/**
 * ### Right Track Transit Feed Classes
 * These classes are used to represent the different components of a Right
 * Track Transit Feed
 * @module realtime/TransitFeed
 */


module.exports = {

  /**
   * TransitFeed Class
   * @see TransitFeed
   */
  TransitFeed: require('./TransitFeed.js'),

  /**
   * TransitDivision Class
   * @see TransitDivision
   */
  TransitDivision: require('./TransitDivision.js'),

  /**
   * TransitLine Class
   * @see TransitLine
   */
  TransitLine: require('./TransitLine.js'),

  /**
   * TransitEvent Class
   * @see TransitEvent
   */
  TransitEvent: require('./TransitEvent.js')

};