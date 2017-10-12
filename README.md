Right Track Core Library
========================

#### node module: [right-track-core](https://www.npmjs.com/package/right-track-core)

--- 

This Node module contains the core data classes and functionality of the
[Right Track Library](https://github.com/right-track/). It can query a 
_Right Track Database_ (a combination of GTFS data and additional custom data) 
that is built using the [right-track-db-build](https://github.com/right-track/right-track-db-build) 
module and create data classes representing the queried data.

This module is a requirement for the [right-track-server](https://github.com/right-track/right-track-server), 
the [right-track-online](https://github.com/right-track/right-track-online) website 
and the planned upcoming right track mobile apps.

Agency specific functionality (such as real-time feed information) is 
added through the various [right-track-agency-{id}](https://github.com/right-track/right-track-agency) 
modules.

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
  - Station Real-Time Status Feed
    - Station Feed
    - Station Feed Departure
    - Station Feed Departure Status
- Right Track Database queries
- General purpose utility functions

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
const mnr = require('right-track-agency-mnr');

// Get the agency configuration properties
let config = mnr.config.get();

// Create the Right Track DB using the mnr config
let db = new RightTrackDB(config.id, config.db.location);

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