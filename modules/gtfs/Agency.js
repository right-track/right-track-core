'use strict';

/**
 * GTFS Agency Class
 * @see {@link Agency}
 * @module gtfs/Agency
 */

/**
 * GTFS Agency
 * -----------
 * Representation of the GTFS Agency definition.
 *
 * GTFS Required Fields:
 * - Agency Name
 * - Agency URL
 * - Agency Timezone
 *
 * GTFS Optional Fields:
 * - Agency ID
 *
 * **Module:** {@link module:gtfs/Agency|gtfs/Agency}
 *
 * @see {@link https://developers.google.com/transit/gtfs/reference/agency-file|GTFS Spec}
 * @class
 * @alias Agency
 */
class Agency {

	/**
	 * Agency Constructor
	 * @constructor
	 * @param {string} name Agency Name
	 * @param {string} url Agency URL
	 * @param {string} timezone Agency Timezone
	 * @param {string} [id] Agency ID
	 */
	constructor(name, url, timezone, id='-1') {

    /**
     * Full name of the transit agency
     * @type {string}
     */
		this.name = name;

    /**
     * Fully qualified and escaped URL of the transit agency
     * @type {string}
     */
		this.url = url;

    /**
     * Timezone code where the transit agency is located
     * @type {string}
     * @see  {@link http://en.wikipedia.org/wiki/List_of_tz_zones|List of valid timezone codes}
     */
		this.timezone = timezone;

    /**
     * Unique ID that identifies the transit agency
     * @type {string}
     */
		this.id = id;
	}

}


module.exports = Agency;
