'use strict';

/**
 * Right Track Data Classes
 * ------------------------
 *
 * The following modules represent Right Track data types:
 * - [About]{@link module:rt/About}
 * - [Favorite]{@link module:rt/Favorite}
 * - [Holiday]{@link module:rt/Holiday}
 * - [Link]{@link module:rt/Link}
 * - [StationFeed]{@link module:rt/StationFeed}
 *
 * @module rt
 */

module.exports = {
  About: require('./About.js'),
  Favorite: require('./Favorite.js'),
  Holiday: require('./Holiday.js'),
  Link: require('./Link.js'),
  StationFeed: require('./StationFeed/')
};
