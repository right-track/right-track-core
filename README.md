Right Track Core Library
========================
 
**GitHub repo:** [right-track/right-track-core](https://github.com/right-track/right-track-core)

--- 

This Node module contains the core data classes and functionality of the
[Right Track Library](https://github.com/right-track/). It can query a 
_RightTrackDB_ (a SQLite database that combines GTFS data with additional data) 
that is built using the [right-track-db-build](https://github.com/right-track/right-track-db-build) 
module and create data classes representing the queried data.

This module is a requirement for the [right-track-server](https://github.com/right-track/right-track-server) 
and the [right-track-pwa](https://github.com/right-track/right-track-pwa) website.

Agency specific functionality (such as real-time feed information) is 
added through the various implementations of the _RightTrackAgency_ classes, such as 
[Metro North](https://github.com/right-track/right-track-agency-mnr) or [LIRR](https://github.com/right-track/right-track-agency-lirr).

Transit Agency specific Transit Feeds that provide real-time transit event information 
is added through the various implementations of the _RightTrackTransitAgency_ classes, such as 
[MTA](https://github.com/right-track/right-track-transit-mta) or 
[NYSTA](https://github.com/right-track/right-track-transist-nysta).

### Features and Functionality

This project is still very much a work in progress and is being actively 
developed.  Functionality may be added and/or removed without notice.

Currently, the module supports the following features:

- GTFS Data Models:
  - Agency
  - Route
  - Service (from gtfs calendar.txt)
  - ServiceException (from gtfs calendar_dates.txt)
  - Stop
  - StopTime
  - Trip
- Right Track Data Models:
  - About (database metadata)
  - Favorite (Class for User favorites - station and trips)
  - Holiday (service information for holidays)
  - Link (links for additional transit resources)
- Right Track Database queries
- Trip Search Classes and Query Functions
  - Trip Search
  - Trip Search Result
  - GTFS schedule search functions (including transfers)
- General purpose utility functions
- Abstract Right Track Classes:
  - RightTrackDB (Class for managing the SQLite database)
  - RightTrackAgency (Class containing agency-specific information and the function for building Station Feeds)
  - RightTrackTransitAgency (Class containing transit agency-specific information and the function for building Transit Feeds)

### Documentation

Full documentation can be found in the **/doc/** directory in this 
repository or online at [https://docs.righttrack.io/right-track-core](https://docs.righttrack.io/right-track-core)

### Module Structure

This module is essentially a bundled group of sub-modules representing each of 
the supported data types.  To import the entire collection, `require` the 
`right-track-core` module.  The returned Object will be a collection of all of 
the sub-modules that follows a package-like structure mirroring the module paths.

For example, to get the GTFS `Agency` class from the collection:

```jacascript
const core = require('right-track-core');
const Agency = core.gtfs.Agency;
``` 

Sub-modules can also be loaded individually by requiring the specific module:

```javascript
const Agency = require('right-track-core/modules/gtfs/Agency');
```

Refer to the **Documentation** for the complete module structure.

### Usage

#### Create a GTFS data class

```javascript
const core = require('right-track-core');
const Agency = core.gtfs.Agency;
const Route = core.gtfs.Route;

// Create a new Agency for Metro North Railroad
let metroNorth = new Agency('Metro North Railroad', 'https://mta.info/mnr', 'America/New_York', 'mnr');
console.log(metroNorth);
// Agency {
//   name: 'Metro North Railroad',
//   url: 'https://mta.info/mnr',
//   timezone: 'America/New_York',
//   id: 'mnr' 
// }


// Create a new Route for the New Haven Line
let newHavenLine = new Route('nh', 'new haven', 'New Haven Line', Route.ROUTE_TYPE_RAIL, metroNorth, 'ff0000', '000000');
console.log(newHavenLine);
// Route {
//   id: 'nh',
//   shortName: 'new haven',
//   longName: 'New Haven Line',
//   type: 2,
//   agency:
//     Agency {
//       name: 'Metro North Railroad',
//       url: 'https://mta.info/mnr',
//       timezone: 'America/New_York',
//       id: 'mnr' 
//     },
//   color: 'ff0000',
//   textColor: '000000' 
// }
```

#### Query a Right Track Database

The _query_ functions of this module query a specific type of SQLite database 
([Right Track Database](https://github.com/right-track/right-track-db-build)) that 
contains the GTFS data and additional Right Track data. In order to make a query, 
there are two additional dependencies:

- A **RightTrackDB** Class Object. This acts as a SQLite wrapper that provides 
the actual SQLite functionality.  The [right-track-db-sqlite3](https://github.com/right-track/right-track-db-sqlite3) 
module provides this functionality using the [node-sqlite3](https://github.com/mapbox/node-sqlite3) 
module and should work in any environment supported by node-sqlite3.

- A **Right Track Agency** implementation.  This provides the agency-specific 
configuration properties as well as the agency's Right Track Database (or the 
location of the database).

The following example queries the information for a `Stop` with id `110` from a 
Right Track Database for [Metro North Railroad](https://github.com/right-track/right-track-agency-mnr). 

```javascript
const core = require('right-track-core');
const RightTrackDB = require('right-track-db-sqlite3');
const MNR = require('right-track-agency-mnr');

// Create the Right Track DB using the MNR Right Track Agency
let db = new RightTrackDB(MNR);

// Query the database for the stop with ID == '110'
core.query.stops.getStop(db, '110', function(err, stop) {
  console.log(stop);
});

// Returns Stop:
// Stop {
//   id: '110',
//   name: 'Larchmont',
//   lat: 40.933394,
//   lon: -73.759792,
//   url: 'http://as0.mta.info/mnr/stations/station_detail.cfm?key=208',
//   wheelchairBoarding: 1,
//   statusID: '110',
//   transferWeight: 1171 
// }
```

#### Schedule Trip Search

The _search_ functions of this module can query the GTFS schedule to build a set
of Trip Search Results that connect the Origin and Destination Stops together with
either a direct Trip or one that includes one or more transfers.

The Search parameters can be customized with the following options:

| Option Name | Default Value | Description |
| ----------- | ------------- | ----------- |
| `allowTransfers` | `true` | Enable to allow a Trip Search Result to include one or more transfers to a different Trip at a Transfer Stop.
| `allowChangeInDirection` | `true` | Enable to allow transfers to a Trip running in the opposite direction.
| `preDepartureHours` | `3` | The number of hours **before** the specified departure date/time to include in the results.
| `postDepartureHours` | `6` | The number of hours **after** the specified departure date/time to include in the results.
| `maxLayoverMins` | `30` | The maximum number of minutes to layover at a transfer Stop.
| `minLayoverMins` | `0` | The minimum number of minutes to layover at a transfer Stop.
| `maxTransfers` | `2` | The maximum number of transfers allowed per Trip Search Result.


##### Trip Search Example

 The following example searches the GTFS schedule for Long Island Rail Road between
 the Patchogue and Atlantic Terminal Stops with a desired departure of 1:30 PM on Jan 16, 2018.

 The default options were changed to allow search results up to 8 hours after the desired
 departure.

 ```javascript
 const core = require('right-track-core');
 const RightTrackDB = require('right-track-db-sqlite3');
 const LIRR = require('right-track-agency-lirr');

 const DateTime = core.utils.DateTime;
 const TripSearch = core.search.TripSearch;

 // Set up a Right Track DB for LIRR
 let db = new RightTrackDB(LIRR);

 // Get the Origin and Destination Stops by their IDs
 core.query.stops.getStop(db, '124', function(err, origin) {
   core.query.stops.getStop(db, '12', function(err, destination) {

     // Set Search Paramters
     let dt = DateTime.create("1:30 PM", 20180116);
     let options = {
       postDepartureHours: 8
     };

     // Set up the Trip Search
     let search = new TripSearch(origin, destination, dt, options);

     // Perform the Trip Search
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
```

The resulting output, which prints the Trip Search Results to the console:

```
==== TRIP SEARCH RESULTS: ===
ORIGIN: Patchogue
DESTINATION: Atlantic Terminal
DEPARTURE: 2018-01-16 @ 13:30:00
RESULTS: 9
=============================
Patchogue @ 11:25 AM --> Atlantic Terminal @ 1:33 PM
  Patchogue @ 11:25 AM --> Babylon @ 11:55 AM
  Babylon @ 12:00 PM --> Jamaica @ 12:48 PM
  Jamaica @ 1:13 PM --> Atlantic Terminal @ 1:33 PM
Patchogue @ 1:07 PM --> Atlantic Terminal @ 2:33 PM
  Patchogue @ 1:07 PM --> Jamaica @ 2:12 PM
  Jamaica @ 2:13 PM --> Atlantic Terminal @ 2:33 PM
Patchogue @ 1:25 PM --> Atlantic Terminal @ 3:33 PM
  Patchogue @ 1:25 PM --> Babylon @ 1:55 PM
  Babylon @ 2:00 PM --> Jamaica @ 2:48 PM
  Jamaica @ 3:13 PM --> Atlantic Terminal @ 3:33 PM
Patchogue @ 2:30 PM --> Atlantic Terminal @ 4:03 PM
  Patchogue @ 2:30 PM --> Jamaica @ 3:36 PM
  Jamaica @ 3:43 PM --> Atlantic Terminal @ 4:03 PM
Patchogue @ 3:32 PM --> Atlantic Terminal @ 5:10 PM
  Patchogue @ 3:32 PM --> Babylon @ 4:02 PM
  Babylon @ 4:06 PM --> Jamaica @ 4:44 PM
  Jamaica @ 4:52 PM --> Atlantic Terminal @ 5:10 PM
Patchogue @ 4:43 PM --> Atlantic Terminal @ 6:23 PM
  Patchogue @ 4:43 PM --> Jamaica @ 5:50 PM
  Jamaica @ 6:05 PM --> Atlantic Terminal @ 6:23 PM
Patchogue @ 5:26 PM --> Atlantic Terminal @ 7:10 PM
  Patchogue @ 5:26 PM --> Babylon @ 5:58 PM
  Babylon @ 6:03 PM --> Jamaica @ 6:40 PM
  Jamaica @ 6:52 PM --> Atlantic Terminal @ 7:10 PM
Patchogue @ 6:30 PM --> Atlantic Terminal @ 8:21 PM
  Patchogue @ 6:30 PM --> Babylon @ 7:03 PM
  Babylon @ 7:09 PM --> Jamaica @ 8:01 PM
  Jamaica @ 8:03 PM --> Atlantic Terminal @ 8:21 PM
Patchogue @ 7:39 PM --> Atlantic Terminal @ 9:53 PM
  Patchogue @ 7:39 PM --> Babylon @ 8:09 PM
  Babylon @ 8:13 PM --> Jamaica @ 9:04 PM
  Jamaica @ 9:33 PM --> Atlantic Terminal @ 9:53 PM
 ```


### Abstract Classes

The `core` module now includes the abstract Right Track Classes that are used by 
the implementing database, agency, and transit agency classes.

#### Right Track Database

This is the abstract `RightTrackDB` Class that is used by various [Right Track projects](https://github.com/right-track) 
to query the SQLite [Right Track Database](https://github.com/right-track/right-track-db-build).

An implementation of this Class, such as [right-track-db-sqlite3](https://github.com/right-track/right-track-db-sqlite3),
which uses the node `sqlite3` module, is what will actually be used in the projects.

An implementation of this Class must have the following functions:

- `constructor({RightTrackAgency} agency)`:
    - this is used to initialize the SQLite database
    - `agency`: The `RightTrackAgency` this DB will be used to query.  The 
    agency must have the configuration properties set to the agency's id 
    as well as the database location.

- `select({string} statement, {function} callback)`:
    - this is used to SELECT multiple rows from the SQLite database using 
    the passed statement.  It will return the rows using the passed callback 
    function.
    - `statement`: the full SQLite SELECT statement
    - `callback`: the selectCallback function

- `get({string} statement, {function} callback)`:
    - this is used to SELECT a single row from the SQLite database using the 
    passed statement.  It will return the result using the passed callback 
    function.
        - If no rows are selected, it will return `undefined`
        - If one row is selected, it will return the single row
        - If more than one row is selected, it will return the first row
    - `statement`: the full SQLite SELECT statement
    - `callback`: the getCallback function


#### Right Track Agency

This module provides the abstract RightTrackAgency class which is extended by an implementing 
Right Track Agency.

The abstract class provides the functionality for reading agency configuration files and 
setting the configuration properties.

This module also includes the Station Feed Classes: StationFeed, StationFeedDeparture,  
StationFeedDepartureStatus, and StationFeedDeparturePosition, which are all required when 
an Agency implements the real-time Station Feed functionality.

##### Supported Agencies

The following are Right Track Agencies that implement this abstract class:

- [Metro North Railroad & SLE (mnr)](https://github.com/right-track/right-track-agency-mnr)
- [Long Island Rail Road (lirr)](https://github.com/right-track/right-track-agency-lirr)

##### Configuration

When a `RightTrackAgency` class is instantiated it will read the agency's default 
configuration file (`agency.json` located in the root of the agency's module 
directory).

##### Get Agency Configuration

To get the agency configuration use the `getConifg()` function.  The configuration 
will have a structure similar to: 

```
{
  "name": "Long Island Rail Road",
  "id": "lirr",
  "maintainer": {
    "name": "David Waring",
    "email": "dev@davidwaring.net",
    "website": "https://www.davidwaring.net/"
  },
  "db": {
    "location": "./static/db/latest/database.db",
    "archiveDir": "./static/db/archive/"
  },
  "stationFeed": {
    "stationURL": "http://traintime.lirr.org/traintime.php?startsta={{ORIGIN_ID}}&endsta={{DESTINATION_ID}}",
    "gtfsrt": {
      "url": "https://mnorth.prod.acquia-sites.com/wse/LIRR/gtfsrt/realtime/{{GTFS_RT_API_KEY}}/json",
      "apiKey": ""
    }
  },
  "static": {
    "img": {
      "icon": "./static/img/icon.png"
    }
  },
  "build": {
    "updateURL": "http://web.mta.info/developers/data/lirr/google_transit.zip"
  },
  "colors": {
    "primary": "#0f47a1",
    "primaryText": "#dddddd",
    "secondary": "#ffd54f",
    "secondaryText": "#263238"
  }
}
```

##### Additional Configuration

To provide additional configuration variables, or to override the default ones, 
create a new configuration file with the variables to add: 

```json
{
    "db": {
        "location": "/new/path/to/database.db"
    },
    "stationFeed": {
        "gtfsrt": {
            "apiKey": "your-mta-api-key"
        }
    }
}
```
Then, use the `readConfig(configFile)` to parse the configuration file and 
merge its properties with those already loaded.

The `configFile` path can be an absolute or relative path, with relative 
paths loaded relative to the root of the agency's module directory.

Any relative paths in the configuration file will be loaded relative to the 
directory the new configuration file is located in.

##### Station Feed

A **Station Feed** provides a list of scheduled departures from a single Stop
combined with agency-specific real-time information, such as departure 
status and/or track numbers.

To load an agency-specific `StationFeed`, use the `loadFeed(db, origin, callback)` 
function where:
- `db` is the agency's RightTrackDB
- `origin` is the origin Stop
- `callback` is a callback function: `function(err, feed)` 
    - accepting an `Error` and `StationFeed` as arguments.

See the Documentation for more information on the structure of a `StationFeed`.

##### Example

The following example uses the [right-track-agency-mnr](https://github.com/right-track/right-track-agency-mnr) 
module, which is the Metro North Railroad implementation of a `RightTrackAgency`.

```javascript
const MNR = require('right-track-agency-mnr');
const RightTrackDB = require('right-track-db-sqlite3');
const core = require('right-track-core');

// Load an additional configuration file
// This path is relative to the agency's module directory
MNR.readConfig('./path/to/config.json');

// Create a RightTrackDB for this Agency
let db = new RightTrackDB(MNR);

// Query the Database for Stop with id = '1'
core.query.stops.getStop(db, '1', function(err, stop) {
  
  // Load the agency's StationFeed for this Stop
  MNR.loadFeed(db, stop, function(err, feed) {
    
    // Do something with the station feed
    console.log(feed);
    
  });
  
});
```


#### Right Track Transit Agency

This module provides the abstract `RightTrackTransitAgency` class which is extended by 
an implementing Right Track Transit Agency.

This module also includes the **Transit Feed** Classes: `TransitFeed`, `TransitDivision`,
and `TransitEvent`, which are all required when a Transit Agency implements the real-time 
Transit Feed functionality.

##### Supported Agencies

The following are Right Track Transit Agencies that implement this abstract class:

- [Metropolitan Transportation Authority (mta)](https://github.com/right-track/right-track-transit-mta)
- [NYS Thruway Authority (nysta)](https://github.com/right-track/right-track-transit-nysta)

##### Transit Feed

A **Transit Feed** provides a list of real-time transit events.  A Transit Feed
is broken down into a hierarchical system where a single **Transit Feed** includes
one or more **Divisions**, which in turn includes either one or more child Divisions 
or a list of **Events** (which contain the real-time transit status information).

To load an agency-specific `TransitFeed`, use the `loadFeed(callback)`
function where:
- `callback` is a callback function: `function(err, feed)`
    - accepting an `Error` and `TransitFeed` as arguments.

See the Documentation for more information on the structure of a `TransitFeed`.

##### Example

The following example uses the [right-track-transit-mta](https://github.com/right-track/right-track-transit-mta)
module to build a **Transit Feed** for the Metropolitan Transportation Authority.

```javascript
const mta = require('right-track-transit-mta');

mta.loadFeed(function(err, feed) {
  if ( !err ) {
    console.log(JSON.stringify(feed, null, 2));
  }
});
```