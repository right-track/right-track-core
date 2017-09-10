'use strict';

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
 * @see {@link https://developers.google.com/transit/gtfs/reference/agency-file|GTFS Spec}
 * @class
 */
class Agency {

    /**
     * Agency Constructor
     * @constructor
     * @param {string} name Agency Name
     * @param {string} url Agency URL
     * @param {string} timezone Agency Timezone
     * @param {string=} id Agency ID
     */
    constructor(name, url, timezone,
                id="-1") {
        this.name = name;
        this.url = url;
        this.timezone = timezone;
        this.id = id;
    }

}


module.exports = Agency;
