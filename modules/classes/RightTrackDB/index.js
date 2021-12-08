'use strict';

/**
 * Right Track DB Abstract Class
 * @see {@link RightTrackDB}
 * @module classes/RightTrackDB
 */

/**
 * ### `RightTrackDB` Abstract Class
 *
 * This is the abstract `RightTrackDB` Class that is used by the Right Track projects
 * to query the SQLite [Right Track Database](https://github.com/right-track/right-track-db-build).
 *
 * An implementation of this Class, such as [right-track-db-sqlite3](https://github.com/right-track/right-track-db-sqlite3),
 * which uses the node `sqlite3` module, is what will actually be used in the projects.
 *
 * An implementation of this Class must have the following functions:
 *
 * - `constructor({RightTrackAgency} agency)`:
 *  - this is used to initialize the SQLite database
 *  - `agency`: The `RightTrackAgency` this DB will be used to query.  The
 *     agency must have the configuration properties set to the agency's id
 *     as well as the database location.
 *
 * - `select({string} statement, {function} callback)`:
 *  - this is used to SELECT multiple rows from the SQLite database using
 *    the passed statement.  It will return the rows using the passed callback
 *    function.
 *  - `statement`: the full SQLite SELECT statement
 *  - `callback`: the {@link RightTrackDB~selectCallback|selectCallback} function
 *
 * - `get({string} statement, {function} callback)`:
 *  - this is used to SELECT a single row from the SQLite database using the
 *    passed statement.  It will return the result using the passed callback
 *    function.
 *      - If no rows are selected, it will return `undefined`
 *      - If one row is selected, it will return the single row
 *      - If more than one row is selected, it will return the first row
 *  - `statement`: the full SQLite SELECT statement
 *  - `callback`: the {@link RightTrackDB~getCallback|getCallback} function
 *
 * **Module:** {@link module:classes/RightTrackDB|classes/RightTrackDB}
 *
 * @class
 * @alias RightTrackDB
 * @abstract
 */
class RightTrackDB {

  /**
   * Right Track Database Constructor
   * @param {RightTrackAgency} agency The Right Track Agency this DB will be used to query
   */
  constructor(agency) {
    if (new.target === RightTrackDB) {
      throw new TypeError("Cannot instantiate an abstract RightTrackDB class.  You must use a specific RightTrackDB implementation.");
    }

    // Check agency configuration
    let config = agency.getConfig();
    if ( config === undefined ) {
      throw new Error("The RightTrackAgency has no configuration properties");
    }

    // Set Database properties
    this._agency = agency;
  }


  /**
   * The RightTrackAgency this DB is used to query
   * @returns {RightTrackAgency}
   */
  get agency() {
    return this._agency;
  }

  /**
   * The Right Track Agency id code
   * @returns {string}
   */
  get id() {
    return this._agency.getConfig().id;
  }

  /**
   * The path to the SQLite Right Track DB
   * @returns {string}
   */
  get location() {
    return this._agency.getConfig().db.location;
  }


  /**
   * Select multiple rows from the database
   * @abstract
   * @param {string} statement Select Statement
   * @param {function} callback {@link RightTrackDB~selectCallback|selectCallback} callback function
   */
  select(statement, callback) {}

  /**
   * Select a single row from the database.  If no results are selected, this
   * will return undefined.  If more than 1 results are selected it will
   * return the first result.
   * @abstract
   * @param {string} statement Select Statement
   * @param {function} callback {@link RightTrackDB~getCallback|getCallback} callback function
   */
  get(statement, callback) {}

}


// ==== CALLBACK DEFINITIONS ==== //

/**
 * This callback is performed after performing a SELECT query
 * that can return multiple rows.
 * @callback RightTrackDB~selectCallback
 * @param {Error} error Database Query Error
 * @param {object[]} [rows] Selected rows
 */

/**
 * This callback is performed after performing a SELECT query
 * that will return the first row.
 * @callback RightTrackDB~getCallback
 * @param {Error} error Database Query Error
 * @param {object} [row] First selected row
 */


module.exports = RightTrackDB;