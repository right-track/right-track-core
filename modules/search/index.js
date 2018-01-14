'use strict';

/**
 * ### Trip Search Classes and Functions
 * These classes and functions are used to query the Right Track Database
 * for trips between origin and destination Stops
 * @module search
 */

module.exports = {

  /**
   * Trip Search Class
   * @see TripSearch
   */
  TripSearch: require('./TripSearch.js'),

  /**
   * Trip Search Result Class
   * @see TripSearchResult
   */
  TripSearchResult: require('./TripSearchResult.js'),

  /**
   * Trip Search Result Segment Class
   * @see TripSearchResultSegment
   */
  TripSearchResultSegment: require('./TripSearchResultSegment.js')

};