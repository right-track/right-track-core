'use strict';

const provided = require('../utils/provided.js');


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
 * - Agency Language Code
 * - Agency Phone Number
 * - Agency Fare URL
 * - Agency Email
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
	 * @param {Object} [optional] Optional Arguments
   * @param {string} [optional.id] Agency ID
   * @param {string} [optional.lang] Agency Language Code (two-letter ISO 639-1 code)
   * @param {string} [optional.phone] Agency Phone Number
   * @param {string} [optional.fareUrl] Agency fare website URL
   * @param {string} [optional.email] Agency contact email
	 */
	constructor(name, url, timezone, optional={}) {

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
		this.id = provided(optional.id);

    /**
     * The two-letter (ISO 639-1) language code for the primary language
     * used by the transit agency
     * @type {string}
     */
		this.lang = provided(optional.lang);

    /**
     * A single voice telephone number for the transit agency
     * @type {string}
     */
		this.phone = provided(optional.phone);

    /**
     * The URL of a web page that can be used to purchase tickets
     * for the transit agency
     * @type {string}
     */
		this.fareUrl = provided(optional.fareUrl);

    /**
     * A single valid email address for contacting the transit agency
     * @type {string}
     */
		this.email = provided(optional.email);


	}

}


module.exports = Agency;
