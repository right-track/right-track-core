'use strict';

/**
 * ### Shape Query Functions
 * These functions query the `gtfs_shapes` table in the Right Track Database.
 * @module query/shapes
 */

const cache = require('memory-cache');
const Shape = require('../gtfs/Shape.js');
const Route = require('../gtfs/Route.js');
const Agency = require('../gtfs/Agency.js');


// ==== QUERY FUNCTIONS ==== //

/**
 * Get all of the Shape's Points for the specified Shape ID
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {string} id Shape ID
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Shape[]} callback.shapes The Shape's Points for the specified Shape ID
 */
let getShape = function(db, id, callback) {

  // Check cache for shape
  let cacheKey = db.id + "-" + id;
  let cache = cache_shapesById.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Query the DB
  let select = "SELECT shape_id, shape_pt_lat, shape_pt_lon, shape_pt_sequence, shape_dist_traveled FROM gtfs_shapes WHERE shape_id = '" + id + "';";
  db.select(select, function(err, results) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // Build the Shapes
    let rtn = [];
    for ( let i = 0; i < results.length; i++ ) {
      let row = results[i];
      let shape = new Shape(
        row.shape_id,
        row.shape_pt_lat,
        row.shape_pt_lon,
        row.shape_pt_sequence,
        {
          shapeDistTraveled: row.shape_dist_traveled
        }
      );
      rtn.push(shape);
    }

    // Sort the Shapes
    rtn.sort(Shape.sortBySequence);

    // Return results
    cache_shapesById.put(cacheKey, rtn);
    return callback(null, rtn);

  });

}


/**
 * Get all of the Points grouped by Shape from the database
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Shape[][]} callback.shapes A 2D-Array of Shape Points
 */
let getShapes = function(db, callback) {
  
  // Check cache for shapes
  let cacheKey = db.id + "-shapes";
  let cache = cache_shapes.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Set counters and return shapes
  let count = 0;
  let done = 1;
  let rtn = [];

  // Get the Shape IDs
  let select = "SELECT DISTINCT(shape_id) FROM gtfs_trips WHERE shape_id IS NOT NULL AND shape_id <> '' ORDER BY shape_id ASC;";
  db.select(select, function(err, results) {
    if ( err ) {
      return callback(err);
    }

    // No shapes found
    if ( results.length === 0 ) {
      return callback(null, rtn);
    }

    // Get each Shape
    done = results.length;
    for ( let i = 0; i < results.length; i++ ) {
      let row = results[i];
      getShape(db, row.shape_id, _finish);
    }
  });


  // Return to th main callback once all queries are done
  function _finish(err, shape) {
    if ( err ) {
      return callback();
    }
    else {
      count++;
      rtn.push(shape);
      if ( count >= done ) {
        cache_shapes.put(cacheKey, rtn);
        return callback(null, rtn);
      }
    }
  }
}


/**
 * Get the details of the Route(s) that correspond to the specified 
 * Shape (or all of the Shapes)
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {string} [id] Shape ID
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Object|Route[]} callback.routes Routes associated with each Shape
 */
let getShapeRoutes = function(db, id, callback) {
  if ( !callback && typeof id === 'function' ) {
    callback = id;
    id = undefined;
  }

  // Check cache for routes
  let cacheKey = db.id + "-" + id + "-routes";
  let cache = cache_shapeRoutes.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Build query
  let select = "SELECT shape_id, ";
	select += "gtfs_routes.route_id, route_short_name, route_long_name, route_desc, route_type, route_url, route_color, route_text_color, ";
	select += "gtfs_agency.agency_id, agency_name, agency_url, agency_timezone, agency_lang, agency_phone, agency_fare_url";
  select += " FROM gtfs_trips";
  select += " LEFT JOIN gtfs_routes USING (route_id)";
  select += " LEFT JOIN gtfs_agency USING (agency_id)";
  select += " WHERE shape_id IS NOT NULL AND shape_id <> ''";
  if ( id ) select += " AND shape_id = '" + id + "'";
  select += " GROUP BY shape_id, route_id;";

  // Get the route details for the shape(s)
  db.select(select, function(err, rows) {
    if ( err ) {
      return callback(err);
    }

    // Build response
    let rtn = {};
    for ( let i = 0; i < rows.length; i++ ) {
      let row = rows[i];
      let shape_id = row.shape_id;
      
      // Create Agency
      let agency = new Agency(
        row.agency_name,
        row.agency_url,
        row.agency_timezone,
        {
          id: row.agency_id,
          lang: row.agency_lang,
          phone: row.agency_phone,
          fareUrl: row.agency_fare_url
        }
      );
      
      // Create Route
      let route = new Route(
        row.route_id,
        row.route_short_name,
        row.route_long_name,
        row.route_type,
        {
          agency: agency,
          description: row.route_desc,
          url: row.route_url,
          color: row.route_color,
          textColor: row.route_text_color
        }
      );

      // Add Route to return
      if ( rtn.hasOwnProperty(shape_id) ) {
        rtn[shape_id].push(route);
      }
      else {
        rtn[shape_id] = [route];
      }
    }

    // Return the Routes
    return callback(null, id ? rtn[id] : rtn);
  });
}


/**
 * Get the coordinates of the center of the specified Shape (or all of the Shapes)
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {string} [id] The Shape ID 
 * @param {function} callback Callback function
 * @param {Error} callback.error Database Query Error
 * @param {Object} callback.center The coordinates of the Shape's center
 * @param {number} callback.center.lat The latitiude of the Shape's center
 * @param {number} callback.center.lon The longitude of the Shape's center
 */
let getShapeCenter = function(db, id, callback) {
  if ( !callback && typeof id === 'function' ) {
    callback = id;
    id = undefined;
  }

  // Check cache for shapes
  let cacheKey = db.id + "-" + id + "-center";
  let cache = cache_shapeCenter.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Get the average lat and lon
  let select = "SELECT AVG(shape_pt_lat) AS avg_lat, AVG(shape_pt_lon) AS avg_lon FROM gtfs_shapes";
  if ( id ) {
    select += " WHERE shape_id = '" + id + "'";
  }
  db.get(select, function(err, row) {
    let rtn = {
      lat: row && row.avg_lat ? row.avg_lat : 0,
      lon: row && row.avg_lon ? row.avg_lon : 0
    };
    cache_shapeCenter.put(cacheKey, rtn);
    return callback(err, rtn);
  });
}


// ==== SETUP CACHES ==== //
let cache_shapesById = new cache.Cache();
let cache_shapes = new cache.Cache();
let cache_shapeRoutes = new cache.Cache();
let cache_shapeCenter = new cache.Cache();

/**
 * Clear the ShapesTable caches
 * @private
 */
function clearCache() {
  cache_shapesById.clear();
  cache_shapes.clear();
  cache_shapeRoutes.clear();
  cache_shapeCenter.clear();
}



// Export Functions
module.exports = {
  getShape: getShape,
  getShapes: getShapes,
  getShapeRoutes: getShapeRoutes,
  getShapeCenter: getShapeCenter,
  clearCache: clearCache
}
