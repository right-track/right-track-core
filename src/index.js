'use strict';


// ==== GET RIGHT TRACK CORE CLASSES ==== //

const AboutTable = require('./query/AboutTable.js');
const CalendarTable = require('./query/CalendarTable.js');
const HolidayTable = require('./query/HolidayTable.js');
const LinksTable = require('./query/LinksTable.js');
const RoutesTable = require('./query/RoutesTable.js');
const StopsTable = require('./query/StopsTable.js');
const StopTimesTable = require('./query/StopTimesTable.js');
const TripsTable = require('./query/TripsTable.js');

const Agency = require('./gtfs/Agency.js');
const Route = require('./gtfs/Route.js');
const Service = require('./gtfs/Service.js');
const ServiceException = require('./gtfs/ServiceException.js');
const Stop = require('./gtfs/Stop.js');
const StopTime = require('./gtfs/StopTime.js');
const Trip = require('./gtfs/Trip.js');

const About = require('./rt/About.js');
const Favorite = require('./rt/Favorite.js');
const Holiday = require('./rt/Holiday.js');
const Link = require('./rt/Link.js');
const StationFeed = require('./rt/StationFeed.js');

const DateTime = require('./utils/DateTime');



// ==== DEFINE MODULE EXPORT ==== //

module.exports = {
  query: {
    about: AboutTable,
    calendar: CalendarTable,
    holidays: HolidayTable,
    links: LinksTable,
    routes: RoutesTable,
    stops: StopsTable,
    stoptimes: StopTimesTable,
    trips: TripsTable
  },
  gtfs: {
    Agency: Agency,
    Route: Route,
    Service: Service,
    ServiceException: ServiceException,
    Stop: Stop,
    StopTime: StopTime,
    Trip: Trip
  },
  rt: {
    About: About,
    Favorite: Favorite,
    Holiday: Holiday,
    Link: Link,
    StationFeed: StationFeed
  },
  utils: {
    DateTime: DateTime
  }
};
