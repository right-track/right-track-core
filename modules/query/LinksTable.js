'use strict';

/**
 * ### Link Query Functions
 * These functions query the `rt_links` table in the Right Track Database.
 * @module query/links
 */

const cache = require('memory-cache');
const Link = require('../rt/Link.js');


// ==== CALLBACK FUNCTIONS ==== //

/**
 * This callback is performed after the Link Categories
 * have been selected from the database.
 * @callback module:query/links~getLinkCategoriesCallback
 * @param {Error} error Database Query Error
 * @param {string[]} [categories] The selected link categories
 */

/**
 * This callback is performed after the Links have been
 * selected from the database.
 * @callback module:query/links~getLinksCallback
 * @param {Error} error Database Query Error
 * @param {Link[]} [links] The selected Links
 */



// ==== QUERY FUNCTIONS ==== //


/**
 * Get a list of all link category titles
 *
 * @param {RightTrackDB} db The Right Track DB to query
 * @param {function} callback {@link module:query/links~getLinkCategoriesCallback|getLinkCategoriesCallback} callback function
 */
let getLinkCategories = function(db, callback) {

  // Check Cache for Link Categories
  let cacheKey = 'categories';
  let cache = cache_linkCategories.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Build the select statement
  let select = "SELECT DISTINCT link_category_title FROM rt_links";

  // Query the database
  db.select(select, function(err, results) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // List of categories to return
    let rtn = [];

    // Parse each row
    for ( let i = 0; i < results.length; i++ ) {
      let row = results[i];
      rtn.push(row.link_category_title);
    }

    // Add categories to cache
    cache_linkCategories.put(cacheKey, rtn);

    // Return the categories with the callback
    return callback(null, rtn);

  });

};



/**
 * Get all of the Agency link information from the database
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {function} callback {@link module:query/links~getLinksCallback|getLinksCallback} callback function
 */
function getLinks(db, callback) {

  // Check cache for links
  let cacheKey = 'links';
  let cache = cache_links.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Build select statement
  let select = "SELECT link_category_title, link_title, link_description, link_url FROM rt_links;";

  // Query the database
  db.select(select, function(err, results) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // List of links to return
    let rtn = [];

    // Parse each row
    for ( let i = 0; i < results.length; i++ ) {
      let row = results[i];

      // Build the link
      let link = new Link(
        row.link_category_title,
        row.link_title,
        row.link_description,
        row.link_url
      );

      // Add link to list
      rtn.push(link);
    }

    // Add links to cache
    cache_links.put(cacheKey, rtn);

    // Return the links with the callback
    return callback(null, rtn);

  });

}


/**
 * Get all of the Agency link information from the database
 * with the specified link category title.
 *
 * @param {RightTrackDB} db The Right Track Database to query
 * @param {string} category Link category title
 * @param {function} callback {@link module:query/links~getLinksCallback|getLinksCallback} callback function
 */
function getLinksByCategory(db, category, callback) {

  // Check cache for links for category
  let cacheKey = category;
  let cache = cache_linksByCategory.get(cacheKey);
  if ( cache !== null ) {
    return callback(null, cache);
  }

  // Build select statement
  let select = "SELECT link_category_title, link_title, link_description, link_url " +
    "FROM rt_links WHERE link_category_title='" + category + "';";

  // Query the database
  db.select(select, function(err, results) {

    // Database Query Error
    if ( err ) {
      return callback(err);
    }

    // List of links to return
    let rtn = [];

    // Parse each row
    for ( let i = 0; i < results.length; i++ ) {
      let row = results[i];

      // Build the link
      let link = new Link(
        row.link_category_title,
        row.link_title,
        row.link_description,
        row.link_url
      );

      // Add link to list
      rtn.push(link);
    }

    // Add links to cache
    cache_linksByCategory.put(cacheKey, rtn);

    // Return the links with the callback
    callback(null, rtn);

  });

}


// ==== SETUP CACHES ==== //
let cache_linkCategories = new cache.Cache();
let cache_links = new cache.Cache();
let cache_linksByCategory = new cache.Cache();

/**
 * Clear the LinksTable caches
 * @private
 */
function clearCache() {
  cache_linkCategories.clear();
  cache_links.clear();
  cache_linksByCategory.clear();
}



// Export Functions
module.exports = {
  getLinkCategories: getLinkCategories,
  getLinks: getLinks,
  getLinksByCategory: getLinksByCategory,
  clearCache: clearCache
};