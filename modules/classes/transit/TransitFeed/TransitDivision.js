'use strict';

/**
 * Transit Feed Division
 * ---------------------
 * A single Division contained in a real-time Transit Feed.
 *
 * The Transit Division contains properties about the division (code, name, style) 
 * and either a list of child divisions or Transit Events
 *
 * @class
 * @alias TransitDivision
 */
class TransitDivision {

  /**
   * Create a new Transit Division
   * @param {string} code Division Code
   * @param {string} name Division Name
   * @param {string} [iconPath] Local file path to Division icon (default: none)
   * @param {string} [backgroudColor] Division background color (hex #rrggbb) (default: #3D3D3D)
   * @param {string} [textColor] Division text color (hex #rrggbb) (default: #FFFFFF)
   */
  constructor(code, name, ...styleArgs) {

    /**
     * Transit Division Code
     * @type {string}
     */
    this.code = code;

    /**
     * Transit Division Display Name
     * @type {string}
     */
    this.name = name;

    /**
     * Transit Division Icon File Path
     * @type {string}
     */
    this.iconPath = styleArgs.length === 1 || styleArgs.length === 3 ? styleArgs[0] : undefined;

    /**
     * Transit Division Background Color
     * @type {string}
     */
    this.backgroundColor = styleArgs.length === 2 ? styleArgs[0] 
      : styleArgs.length === 3 ? styleArgs[1]
      : '#3D3D3D';

    /**
     * Transit Division Text Color
     * @type {string}
     */
    this.textColor = styleArgs.length === 2 ? styleArgs[1] 
      : styleArgs.length === 3 ? styleArgs[2]
      : '#FFFFFF';

    /**
     * List of child Transit Divisions
     * @type {TransitDivision[]}
     */
    this.divisions = [];

    /**
     * Transit Division Operating Status
     * @type {string}
     */
    this.status = undefined;

    /**
     * List of Transit Events
     * @type {TransitEvent[]}
     */
    this.events = [];

  }

  /**
   * Get the number of Transit Events for this Division
   * @returns {number}
   */
  getEventCount() {
    let count = 0;
    count += this.events.length;
    for ( let i = 0; i < this.divisions.length; i++ ) {
      count += this.divisions[i].getEventCount();
    }
    return count;
  }

}


module.exports = TransitDivision;
