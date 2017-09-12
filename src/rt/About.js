'use strict';

/**
 * RT About
 * --------
 * Representation of the data in the rt_about table, which holds the
 * information about the Right Track Database.
 *
 * Right Track Fields:
 * - Compile Date
 * - Publish Date
 * - Start Date
 * - End Date
 * - Version
 * - Version Notes
 *
 * **package:** core.rt.About
 *
 * @class
 */
class About {

    /**
     * Right Track About Constructor
     * @constructor
     * @param {int} compile the compile date of the Right Track DB (yyyymmdd)
     * @param {int} publish the publish date of the Right Track DB (yyyymmdd)
     * @param {int} start the start date the Right Track DB schedule (yyyymmdd)
     * @param {int} end the end date of the Right Track DB schedule (yyyymmdd)
     * @param {int} version the version number of the Right Track DB (usually yyyymmddHH)
     * @param {string} notes the version notes of the Right Track DB
     */
    constructor(compile, publish, start, end, version, notes) {
        this.compileDate = compile;
        this.publishDate = publish;
        this.startDate = start;
        this.endDate = end;
        this.version = version;
        this.notes = notes;
    }

}


module.exports = About;