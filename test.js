const core = require('right-track-core');
const RightTrackDB = require('right-track-db-sqlite3');
const LIRR = require('right-track-agency-lirr');

const DateTime = core.utils.DateTime;
const TripSearch = core.search.TripSearch;

let db = new RightTrackDB(LIRR);

core.query.stops.getStopByName(db, "Penn Station", function(err, origin) {
    core.query.stops.getStopByName(db, "Greenport", function(err, destination) {

        let dt = DateTime.create("4:00 PM", 20201218);
        let search = new TripSearch(origin, destination, dt);
        
        search.search(db, function(err, results) {

            // Print the Results
            console.log("==== TRIP SEARCH RESULTS: ===");
            console.log("ORIGIN: " + origin.name);
            console.log("DESTINATION: " + destination.name);
            console.log("DEPARTURE: " + dt.toString());
            console.log("RESULTS: " + results.length);
            console.log("=============================");

            // Parse each Result
            for ( let i = 0; i < results.length; i++ ) {
                let result = results[i];

                console.log(result.origin.stop.name + " @ " + result.origin.departure.getTimeReadable() + " --> " + result.destination.stop.name + " @ " + result.destination.arrival.getTimeReadable());

                // Parse segments when a transfer is required
                if ( result.length > 1 ) {
                    let segments = result.segments;
                    for ( let j = 0; j < segments.length; j++ ) {
                        let segment = segments[j];
                        console.log("  " + segment.enter.stop.name + " @ " + segment.enter.departure.getTimeReadable() + " --> " + segment.exit.stop.name + " @ " + segment.exit.arrival.getTimeReadable());
                    }
                }
            }

        });

    });
});

