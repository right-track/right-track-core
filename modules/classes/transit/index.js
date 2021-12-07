'use strict';

const config = require('@dwaring87/config');
const path = require('path');


/**
 * ### `RightTrackTransitAgency` Abstract Class
 *
 * @class
 * @abstract
 */
class RightTrackTransitAgency {

  /**
   * Abstract Transit Agency class constructor.  The implementing transit agency 
   * should call this constructor with the path to its own module directory:
   * `super(moduleDirectory)` in order to read the default agency configuration 
   * and set the intial configuration properties.
   * 
   * Each implementing Transit Agency should include (at least) the following 
   * properties in its agency config file:
   * - id: Transit Agency ID Code
   * - name: Transit Agency Display Name
   * - description: Transit Agency Description
   * - iconPath: Local file path to the Transit Agency icon
   * - maintainer: Transit Agency maintainer information:
   *    - name: Maintainer name
   *    - email: Maintainer email address
   *    - source: Maintainer's project source address
   * The Transit Agency config file may contain any additional properties that it 
   * may need (ie for the Transit Feed, etc).
   * 
   * @param {string} moduleDirectory The full path to the root of the transit 
   * agency's module directory.  This is where any relative paths to configuration 
   * files will be relative to.
   */
  constructor(moduleDirectory) {

    // Set Transit Agency Moduel Directory
    this._moduleDirectory = moduleDirectory;

    // Setup Config
    this._config = new config(path.normalize(this._moduleDirectory + '/agency.json'));

  }


  // ==== CLASS MEMBERS ==== //

  /**
   * The Transit Agency's module directory
   * @returns {string}
   */
  get moduleDirectory() {
    return path.normalize(this._moduleDirectory);
  }

  /**
   * The Transit Agency's configuration properties
   * @returns {Object}
   */
  get config() {
    return this._config.get();
  }

  /**
   * Transit Agency's id code
   * @returns {string}
   */
  get id() {
    return this.config.id;
  }

  /**
   * The Transit Agency's full name
   * @returns {string}
   */
  get name() {
    return this.config.name;
  }

  /**
   * The Transit Agency's description
   * @returns {string}
   */
  get description() {
    return this.config.description;
  }

  /**
   * The Transit Agency's maintainer information
   * @returns {Object}
   */
  get maintainer() {
    return this.config.maintainer;
  }


  // ==== CONFIGURATION ==== //

  /**
   * Reset the transit agency configuration to the default values
   */
  resetConfig() {
    this._config.reset();
  }

  /**
   * Read an additional transit agency configuration file
   * @param {string} configFile Path to transit agency configuration file.
   * Relative paths will be relative to the root of the transit agency's module directory.
   */
  readConfig(configFile) {
    if ( !path.isAbsolute(configFile) ) {
      configFile = path.normalize(this.moduleDirectory + '/' + configFile);
    }
    this._config.read(configFile);
  }

  /**
   * Get the transit agency configuration
   * @returns {object} Transit Agency configuration
   */
  getConfig() {
    return this.config;
  }

 
  // ==== TRANSIT FEED ==== //

  /**
   * Load the Transit Feed for this Transit Agency
   * @param {function} callback Callback function
   * @param {Error} callback.error Transit Feed Error.  The Error's message will be
   * a pipe (`|`) separated string in the format of: `Error Code|Error Type|Error Message`
   * that will be parsed out by the **Right Track API Server** into a more specific
   * error Response.
   * @param {TransitFeed} [callback.feed] The built `TransitFeed` for the Transit Agency
   * @abstract
   */
  loadFeed(callback) {
    return callback(new Error("4052|Transit Feed Not Supported|This transit agency (" + this.name + ") does not support real-time Transit Feeds"));
  }

  /**
   * Get the matching Transit Division from the Agency's Transit Feed
   * @param {String[]} divisionCodes List of Transit Division codes (in hierarchical order)
   * @param {function} callback Callback function
   * @param {Error} callback.error Transit Feed Error
   * @param {TransitDivision} [callback.division] The matching `TransitDivision`
   */
  getDivision(divisionCodes, callback) {
    this.loadFeed(function(err, feed) {
      if ( err ) {
        return callback(err);
      }
      let division = undefined;
      let divs = feed.divisions;
      for ( let i = 0; i < divisionCodes.length; i++ ) {
        for ( let j = 0; j < divs.length; j++ ) {
          if ( divs[j].code === divisionCodes[i] ) {
            if ( i === divisionCodes.length-1 ) division = divs[j];
            divs = divs[j].divisions;
            break;
          }
        }
      }
      return callback(null, division);
    });
  }
  
}

module.exports = RightTrackTransitAgency;
