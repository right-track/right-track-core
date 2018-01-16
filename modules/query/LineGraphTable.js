'use strict';

/**
 * ### Line Graph Query Functions
 * These functions query the `rt_line_graph` table in the Right Track Database.
 * @module query/linegraph
 */

const cache = require('memory-cache');
const Graph = require('../../lib/graph.js');
const StopsTable = require('./StopsTable.js');
const Stop = require('../gtfs/Stop.js');


// ==== QUERY FUNCTIONS ==== //


/**
 * Get a List of all stops from the Agency Line Graph along all paths from
 * the origin to the destination following the specified stop
 * @param {RightTrackDB} db The Right Track DB to Query
 * @param {String} originId Origin Stop ID
 * @param {String} destinationId Destination Stop ID
 * @param {String} stopId Current Stop ID
 * @param {function} callback Callback function
 * @param {Error} callback.err Database Query Error
 * @param {String[]} [callback.stops] List of following Stops, sorted by transfer weight
 */
function getNextStops(db, originId, destinationId, stopId, callback) {

  // Get the Paths from origin --> destination
  getPaths(db, originId, destinationId, function(err, paths) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // List of Stops to return
    let rtn = [];

    // Parse the Paths
    for ( let i = 0; i < paths.length; i++ ) {
      let path = paths[i];
      let stopFound = false;

      // Parse the Path's Stops
      for ( let j = 0; j < path.length; j++ ) {
        let stop = path[j];

        // First: find the current stop
        if ( !stopFound && stop.id === stopId ) {
          stopFound = true;
        }

        // Add following stops...
        else if ( stopFound ) {

          // ...if not already in the rtn list
          let added = false;
          for ( let k = 0; k < rtn.length; k++ ) {
            if ( rtn[k].id === stop.id ) {
              added = true;
            }
          }
          if ( !added ) {
            rtn.push(stop);
          }

        }

      }

    }

    // Sort the Stops by transfer weight
    rtn.sort(_sort);

    // Create an array of the IDs
    let ids = [];
    for ( let i = 0; i < rtn.length; i++ ) {
      ids.push(rtn[i].id);
    }

    // Return the IDs
    return callback(null, ids);

  });


  /**
   * Sort the Graph Stops by transfer weight (descending)
   * @private
   */
  function _sort(a,b) {
    if (a.weight < b.weight) {
      return 1;
    }
    else if (a.weight > b.weight) {
      return -1;
    }
    else {
      return 0;
    }
  }

}


/**
 * Get all possible paths from the origin to the destination following the
 * Agency Line Graph
 * @param {RightTrackDB} db The Right Track DB to Query
 * @param {String} originId Origin Stop ID
 * @param {String} destinationId Destination Stop ID
 * @param {function} callback Callback Function
 * @param {Error} callback.err Database Query Error
 * @param {Object[][]} [callback.paths] Route Paths
 * @param {String} callback.paths[].id Stop ID
 * @param {int} callback.paths[].weight Stop Transfer Weight
 */
function getPaths(db, originId, destinationId, callback) {

  // Get Graph
  buildGraph(db, function(err, graph) {
    if ( err ) {
      return callback(err);
    }

    // Paths to return
    let rtn = [];

    // Search the Graph
    for ( let it = graph.paths(originId, destinationId), kv; !(kv = it.next()).done;) {
      let path = [];
      for ( let i = 0; i < kv.value.length; i++ ) {
        let stop = graph.vertexValue(kv.value[i]);
        path.push({
          id: stop.id,
          weight: stop.transferWeight
        });
      }
      rtn.push(path);
    }

    // Return the paths
    return callback(null, rtn);

  });

}



/**
 * Build the entire Agency Line Graph
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {function} callback Callback function
 * @param {Error} callback.err Database Query Error
 * @param {Graph} [callback.graph] Agency Graph
 * @see {@link https://www.npmjs.com/package/graph.js|graph.js package}
 */
function buildGraph(db, callback) {

  // Check cache for graph
  let cacheKey = db.id + "-graph";
  let cache = cache_graph.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Build Graph
  let graph = new Graph();

  // Add the Vertices
  _addGraphVertices(db, graph, function(err, graph) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // Add Graph Edges
    _addGraphEdges(db, graph, function(err, graph) {

      // Database Query Error
      if ( err ) {
        return callback(err);
      }

      // Return the finished graph
      cache_graph.put(cacheKey, graph);
      return callback(null, graph);

    });

  });

}


/**
 * Add all Stops as Vertices to the Graph
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {Graph} graph The Graph to add vertices to
 * @param {function} callback Callback function(err, graph)
 * @private
 */
function _addGraphVertices(db, graph, callback) {

  // Get all Stops
  StopsTable.getStops(db, function(err, stops) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // Add each Stop as a Vertex
    for ( let i = 0; i < stops.length; i++ ) {
      graph.addNewVertex(stops[i].id, stops[i]);
    }

    // Return the Graph
    return callback(null, graph);

  });

}

/**
 * Add edges to each Vertex in the Graph
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {Graph} graph The Graph to add edges to
 * @param {function} callback Callback function(err, graph)
 * @private
 */
function _addGraphEdges(db, graph, callback) {

  // Counters
  let done = 0;
  let count = graph.vertexCount();

  // Loop through each Vertex in the Graph
  for ( let [stopId, stop] of graph ) {

    // Get the Edges for the Vertex
    _getStopEdges(db, stopId, function(err, edges) {

      // Database Query Error
      if ( err ) {
        return callback(err);
      }

      // Add each edge to the Graph
      for ( let i = 0; i < edges.length; i++ ) {
        graph.ensureEdge(stopId, edges[i]);
        graph.ensureEdge(edges[i], stopId);
      }

      // Finish the Vertex
      _finish();

    });

  }

  // Keep track of finished vertices
  function _finish() {
    done++;
    if ( done === count ) {
      return callback(null, graph);
    }
  }

}


/**
 * Get the Line Graph Edges (next Stop ID, direction, and weight)
 * for the specified Stop
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {String} firstId The first Stop ID
 * @param {function} callback Callback Function(err, edges)
 * @private
 */
function _getStopEdges(db, firstId, callback) {

  // Check cache for edges
  let cacheKey = db.id + "-" + firstId;
  let cache = cache_edges.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Build Select Statement
  let select = "SELECT stop2_id FROM rt_line_graph WHERE stop1_id='" + firstId + "';";

  // Query the database
  db.select(select, function(err, results) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // List of edges to return
    let rtn = [];

    // Add each connected stop
    for ( let i = 0; i < results.length; i++ ) {
      rtn.push(results[i].stop2_id);
    }

    // Return edges
    cache_edges.put(cacheKey, rtn);
    return callback(null, rtn);

  });

}




// ==== SETUP CACHES ==== //
let cache_firstStops = new cache.Cache();
let cache_edges = new cache.Cache();
let cache_graph = new cache.Cache();


/**
 * Clear the RouteGraphTable caches
 * @private
 */
function clearCache() {
  cache_firstStops.clear();
  cache_edges.clear();
  cache_graph.clear();
}


// Export Functions
module.exports = {
  buildGraph: buildGraph,
  getPaths: getPaths,
  getNextStops: getNextStops,
  clearCache: clearCache
};