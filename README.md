Right Track Core Library
=======================

This module contains the core data classes and functionality 
of the Right Track Library.  It can query a _Right Track Database_ 
(a combination of GTFS data and additional custom data) that is 
built using the **right-track-db-build** module and create data classes 
representing the data.

This module is a requirement for the **right-track-api-server**, the 
**right-track-online** website and the **right-track-mobile** mobile apps.

Agency specific functionality (such as real-time feed information) is 
added through the **right-track-agency-{id}** modules.

### Features and Functionality

This project is still very much a work in progress and is being actively 
developed.  Functionality may be added and/or removed without notice.

Currently, the module supports the following features:

- GTFS Data Models for the following classes:
    - Agency
    - Route
    - Service (from gtfs calendar.txt)
    - ServiceException (from gtfs calendar_dates.txt)
    - Stop
    - StopTime
    - Trip
- Right Track Data Models
    - additional data added to Stops
    - About (database metadata)
    - Holiday (service information for holidays)
    - Link (links for additional transit resources)
- Right Track Database queries
- General purpose utility functions

### Documentation

Full documentation can be found in the **/doc/** directory in this 
repository.

### Module Structure

To use this module, the data classes and query functions are returned 
on import in an Object that follows a package-like structure

```javascript
const core = require("right-track-core");
```

where ```core``` is an object with the following structure:

```
// See full documentation for function parameters
{ 
  query: { 
     about: { 
         getAbout()
     },
     calendar: { 
         getService(),
         getServicesEffective(),
         getServicesDefault(),
         getServiceExceptions() 
     },
     holidays: { 
         getHolidays(),
         getHoliday(),
         isHoliday() 
     },
     links: { 
         getLinkCategories(),
         getLinks(),
         getLinksByCategory() 
     }, 
     routes: { 
         getRoute(),
         getRoutes() 
     },
     stops: { 
         getStop(),
         getStopByName(),
         getStopByStatusId(),
         getStops(),
         getStopsByRoute(),
         getStopsWithStatus() 
     },
     stoptimes: { 
         getStopTimesByTrip(),
         getStopTimeByTripStop() 
     },
     trips: { 
         getTrip(),
         getTripByDeparture() 
     } 
  },
  gtfs: { 
     Agency()
     Route() {
         Route.ROUTE_TYPE_LIGHT_RAIL: 0,
         Route.ROUTE_TYPE_SUBWAY: 1,
         Route.ROUTE_TYPE_RAIL: 2,
         Route.ROUTE_TYPE_BUS: 3,
         Route.ROUTE_TYPE_FERRY: 4,
         Route.ROUTE_TYPE_CABLE_CAR: 5,
         Route.ROUTE_TYPE_GONDOLA: 6,
         Route.ROUTE_TYPE_FUNICULAR: 7 
     },
     Service() {
         Service.SERVICE_AVAILABLE: 1, 
         Service.SERVICE_UNAVAILABLE: 0
     },
     ServiceException() {
         Service.SERVICE_ADDED: 1, 
         Service.SERVICE_REMOVED: 2
     },
     Stop() { 
         Stop.WHEELCHAIR_BOARDING_UNKNOWN: 0,
         Stop.WHEELCHAIR_BOARDING_YES: 1,
         Stop.WHEELCHAIR_BOARDING_NO: 2,
         Stop.sortById(),
         Stop.sortByName(),
         Stop.sortByTransferWeight()
     },
     StopTime() { 
         StopTime.PICKUP_TYPE_REGULAR: 0,
         StopTime.PICKUP_TYPE_NONE: 1,
         StopTime.PICKUP_TYPE_PHONE_AGENCY: 2,
         StopTime.PICKUP_TYPE_DRIVER_COORDINATION: 3,
         StopTime.DROP_OFF_TYPE_REGULAR: 0,
         StopTime.DROP_OFF_TYPE_NONE: 1,
         StopTime.DROP_OFF_TYPE_PHONE_AGENCY: 2,
         StopTime.DROP_OFF_TYPE_DRIVER_COORDINATION: 3,
         StopTime.sortByStopTransferWeight(),
         StopTime.sortByStopSequence()
     },
     Trip() { 
         Trip.WHEELCHAIR_ACCESSIBLE_UNKNOWN: 0,
         Trip.WHEELCHAIR_ACCESSIBLE_YES: 1,
         Trip.WHEELCHAIR_ACCESSIBLE_N0: 2 
     } 
  },
  rt: {
     About(),
     Holiday(),
     Link()
  },
  utils: { 
     DateTime() {
         create(),
         createFromTime(),
         createFromDate()
     }
  }
}
```

### Usage

Create a GTFS data class

```javascript
const core = require("right-track-core");

// Create a new Agency for Metro North Railroad
let metroNorth = new core.gtfs.Agency("Metro North Railroad", "https://mta.info/mnr", "America/New_York", "mnr");
console.log(metroNorth);
// Agency {
//     name: 'Metro North Railroad',
//     url: 'https://mta.info/mnr',
//     timezone: 'America/New_York',
//     id: 'mnr' 
// }


// Create a new Route for the New Haven Line
const Route = core.gtfs.Route;
let newHavenLine = new Route("nh", "new haven", "New Haven Line", Route.ROUTE_TYPE_RAIL, metroNorth, "ff0000", "000000");
console.log(newHavenLine);
// Route newHavenLine:
// Route {
//     id: 'nh',
//     shortName: 'new haven',
//     longName: 'New Haven Line',
//     type: 2,
//     agency:
//         Agency {
//             name: 'Metro North Railroad',
//             url: 'https://mta.info/mnr',
//             timezone: 'America/New_York',
//             id: 'mnr' 
//         },
//     color: 'ff0000',
//     textColor: '000000' 
// }
```

Query a **Right Track Database** to get data.

Note: the _query_ functions of this module require a _RightTrackDB_ object as a 
parameter.  This class is an SQLite wrapper class that provides the actual SQLite 
functionality.  The **right-track-db-sqlite3** module provides this functionality 
using the [node-sqlite3](https://github.com/mapbox/node-sqlite3) module.

```javascript
const core = require("right-track-core");
const RightTrackDB = require("right-track-db-sqlite3");
const mnr = require("right-track-agency-mnr");
const config = mnr.config("../path/to/config.json");  // use mnr.config() to use default configuration

// Create the Right Track DB using the mnr config
let db = new RightTrackDB(config.id, config.db_location);

// Query the database for the stop with ID == '110'
core.query.stops.getStop(db, "110", function(stop) {
    console.log(stop);
});

// Returns Stop:
// Stop {
//     id: '110',
//     name: 'Larchmont',
//     lat: 40.933394,
//     lon: -73.759792,
//     url: 'http://as0.mta.info/mnr/stations/station_detail.cfm?key=208',
//     wheelchairBoarding: 1,
//     statusID: '110',
//     transferWeight: 1171 
// }
```