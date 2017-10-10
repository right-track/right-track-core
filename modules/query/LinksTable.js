'use strict';

/**
 * ### Link Query Functions
 * These functions query the `rt_links` table in the Right Track Database.
 * @module query/links
 */

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


    // Return the links with the callback
    callback(null, rtn);

  });

}


// Export Functions
module.exports = {
  getLinkCategories: getLinkCategories,
  getLinks: getLinks,
  getLinksByCategory: getLinksByCategory
};