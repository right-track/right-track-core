'use strict';


/**
 * Station Feed
 * ----------------
 * A real-time feed of status information of departures
 * from a single Stop.
 */
class StationFeed {

    /**
     * Station Feed Constructor
     * @constructor
     * @param {Stop} stop Station Feed Stop
     * @param {DateTime} updated DateTime of when the data was updated
     * @param {StationFeedDeparture[]} departures List of Station Feed Departures
     */
    constructor(stop, updated, departures) {
        this.stop = stop;
        this.updated = updated;
        this.departures = departures;
    }

}


/**
 * Station Feed Departure
 * ----------------------
 * Real-time and departure information about the departure of
 * a single Trip from a Stop.  Used by the StationFeed Class.
 */
class StationFeedDeparture {

    /**
     * Station Feed Departure Constructor
     * @constructor
     * @param {DateTime} departure DateTime of scheduled departure
     * @param {Stop} destination Destination Stop
     * @param {Trip} trip Departure Trip
     * @param {StationFeedDepartureStatus} status Real-time Status Information
     */
    constructor(departure, destination, trip, status) {
        this.departure = departure;
        this.destination = destination;
        this.trip = trip;
        this.status = status;
    }

}


/**
 * Station Feed Departure Status
 * -----------------------------
 * Real-time Status Information about a departure from a Stop.
 */
class StationFeedDepartureStatus {

    /**
     * Station Feed Departure Status Constructor
     * @constructor
     * @param {string} status Status label
     * @param {int} delay Delay of departure (minutes)
     * @param {DateTime} estDeparture DateTime of estimated departure
     * @param {string} track Departure Track
     * @param {string=} remarks Additional Remarksr
     */
    constructor(status, delay, estDeparture, track, remarks) {
        this.status = status;
        this.delay = delay;
        this.estDeparture = estDeparture;
        this.track = track;
        this.remarks = remarks;
    }

}


// Export the Classes
module.exports = {
    feed: StationFeed,
    departure: StationFeedDeparture,
    status: StationFeedDepartureStatus
};