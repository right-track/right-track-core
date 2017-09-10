'use strict';

/**
 * RT Holiday
 * --------
 * Representation of the data in the rt_holidays table, which holds
 * information about observed holidays and their service information.
 *
 * Right Track Fields:
 * - Date
 * - Name
 * - Peak
 * - Service Information
 *
 * @class
 */
class Holiday {

    /**
     * Right Track Holiday Constructor
     * @constructor
     * @param {int} date Holiday Date (yyyymmdd)
     * @param {string} name Holiday Name
     * @param {boolean} peak Holiday Peak Status (true if there are still peak trains)
     * @param {string} serviceInformation Holiday Service Information
     */
    constructor(date, name, peak, serviceInformation) {
        this.date = date;
        this.name = name;
        this.peak = peak;
        this.serviceInformation = serviceInformation;
    }

}


module.exports = Holiday;