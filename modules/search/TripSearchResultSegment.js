'use strict';

/**
 * Trip Search Result Segment Class
 * @see {@link TripSearchResultSegment}
 * @module search/TripSearchResultSegment
 */


/**
 * Trip Search Result Segment
 * --------
 * This Class represents a single Trip Search Result Segment.  One or more of
 * these makes a {@link TripSearchResult|Trip Search Result}.
 *
 * A Trip Search Result Segment is an individual Trip that a rider would take
 * on their way from their original Origin and Destination Stops.  A single
 * Segment may not necessarily contain either the original Origin or final
 * Destination Stops.
 *
 * The 'Enter' and 'Exit' Stops are those where a rider will get on a Trip or
 * leave a Trip, respectively, on their way from their original Origin Stop
 * to their final Destination Stop.
 *
 * **Module:** {@link module:search/TripSearchResultSegment|search/TripSearchResultSegment}
 *
 * @class
 * @alias TripSearchResultSegment
 */
class TripSearchResultSegment {

  /**
   * Create a new Trip Search Result Segment from the provided Trip
   * @param {Trip} trip The Trip that makes up this Segment
   * @param {Stop} enter The Stop where the Segment starts
   * @param {Stop} exit The Stop where the Segment ends
   */
  constructor(trip, enter, exit) {

    /**
     * The Trip that makes up this Segment
     * @type {Trip}
     */
    this.trip = trip;

    /**
     * The StopTime where the Segment starts
     * @type {StopTime}
     */
    this.enter = trip.getStopTime(enter);

    /**
     * The StopTime where the Segment ends
     * @type {StopTime}
     */
    this.exit = trip.getStopTime(exit);

  }

  /**
   * The Trip Origin StopTime
   * @returns {StopTime}
   */
  get origin() {
    return this.trip.stopTimes[0];
  }

  /**
   * The Trip Destination StopTime
   * @returns {StopTime}
   */
  get destination() {
    return this.trip.stopTimes[this.trip.stopTimes.length-1];
  }

  /**
   * Travel Time (in minutes) on this Segment
   * @returns {int}
   */
  get travelTime() {
    return (this.exit.arrival.toTimestamp() - this.enter.departure.toTimestamp())/60000;
  }

}


module.exports = TripSearchResultSegment;