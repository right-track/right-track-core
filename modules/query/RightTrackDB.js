'use strict';

/**
 * Right Track Database Class (RightTrackDB) Definition
 * @typedef {Object} RightTrackDB
 * @property {function} get Select a single row from the database.  If no results
 * are selected, this will return undefined.  If more than 1 results are selected
 * it will return the first result.
 * @property {function} select Select multiple rows from the database
 */
