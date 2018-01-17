'use strict';

/**
 * Trip Search Result Class
 * @see {@link TripSearchResult}
 * @module search/TripSearchResult
 */


const TripSearchResultSegment = require('./TripSearchResultSegment.js');
const TripSearchResultTransfer = require('./TripSearchResultTransfer.js');


/**
 * Trip Search Result
 * --------
 * This Class represents a single Trip Search Result.  It consists of one or
 * more {@link TripSearchResultSegment|Trip Search Result Segments}, which
 * are the individual Trips a rider would take to get from their original
 * Origin Stop to their final Destination Stop.
 *
 * **Module:** {@link module:search/TripSearchResult|search/TripSearchResult}
 *
 * @class
 * @alias TripSearchResult
 */
class TripSearchResult {

  /**
   * Create a new Trip Search Result from the provided segment(s)
   * @param {TripSearchResultSegment|TripSearchResultSegment[]} segments Trip Search Result Segment(s)
   */
  constructor(segments) {

    // Convert a single Segment into an Array
    if ( !Array.isArray(segments) ) {
      segments = [segments];
    }

    /**
     * The Trip Search Result Segments
     * @type {TripSearchResultSegment[]}
     */
    this.segments = segments;

    /**
     * The number of Trip Search Result Segments in this Result
     * @type {int}
     */
    this.length = this.segments.length;

    /**
     * The StopTime of the Trip Search's Origin Stop
     * @type {StopTime}
     */
    this.origin = this.segments[0].enter;

    /**
     * The StopTime of the Trip Search's Destination Stop
     * @type {StopTime}
     */
    this.destination = this.segments[this.length-1].exit;

    /**
     * Total Travel Time (in minutes) - includes all segments and layovers
     * @type {int}
     */
    this.travelTime = (this.destination.arrival.toTimestamp() - this.origin.departure.toTimestamp())/60000;

    /**
     * List of Transfers
     * @type {TripSearchResultTransfer[]}
     */
    this.transfers = this._buildTransfers();

  }


  /**
   * Build the List of Transfers
   * @returns {TripSearchResultTransfer[]}
   * @private
   */
  _buildTransfers() {

    // List of transfers
    let rtn = [];

    // Build Each Transfer
    for ( let i = 0; i < this.length-1; i++ ) {

      // Build the Transfer Stop
      let transfer = new TripSearchResultTransfer(
        this.segments[i].exit.stop,
        this.segments[i].exit.arrival,
        this.segments[i+1].enter.departure
      );

      // Add to List
      rtn.push(transfer);

    }

    // Return list of transfers
    return rtn;

  }


}


/**
 * Sort Trip Search Results by their departure from the Origin
 * @param {TripSearchResult} a first TripSearchResult
 * @param {TripSearchResult} b second TripSearchResult
 * @return {number} compare integer
 */
TripSearchResult.sortByDeparture = function(a, b) {
  if ( a.origin.departure.toTimestamp() < b.origin.departure.toTimestamp() ) {
    return -1;
  }
  else if ( a.origin.departure.toTimestamp() > b.origin.departure.toTimestamp() ) {
    return 1;
  }
  else {
    return 0;
  }
};



module.exports = TripSearchResult;