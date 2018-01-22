'use strict';


/**
 * Check if the field has been provided (not null, undefined or blank)
 * @param field Field to check
 * @param rtn Default value to return if not provided
 * @private
 */
function provided(field, rtn=undefined) {
  return field !== null && field !== undefined && field !== '' ? field : rtn;
}


module.exports = provided;