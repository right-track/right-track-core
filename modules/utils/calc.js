'use strict';

/**
 * Right Track calculation helper functions
 * @module utils/calc
 */


/**
 * Calculate the (Great-Circle) Distance between two points
 * @param {number} lat1 Latitude of Point 1
 * @param {number} lon1 Longitude of Point 1
 * @param {number} lat2 Latitude of Point 2
 * @param {number} lon2 Longitude of Point 2
 * @returns {number} distance between points in miles
 */
function distance(lat1, lon1, lat2, lon2) {
  let R = 6371; // Radius of the earth in km
  let dLat = _deg2rad(lat2-lat1);  // deg2rad below
  let dLon = _deg2rad(lon2-lon1);
  let a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(_deg2rad(lat1)) * Math.cos(_deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  ;
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  let d = R * c; // Distance in km
  return d * 0.621371; // Return distance in miles
}

function _deg2rad(deg) {
  return deg * (Math.PI/180)
}


module.exports = {
  distance: distance
};