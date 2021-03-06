'use strict';

/**
 * Right Track Link Class
 * @see {@link Link}
 * @module rt/Link
 */

/**
 * RT Link
 * --------
 * Representation of the data in the rt_links table.  These links are
 * for additional resources and information regarding the service agency.
 *
 * Right Track Fields:
 * - Category
 * - Title
 * - Description
 * - Url
 *
 * **Module:** {@link module:rt/Link|rt/Link}
 *
 * @class
 * @alias Link
 */
class Link {

  /**
   * Right Track Link Constructor
   * @constructor
   * @param {string} category Link Category
   * @param {string} title Link Title
   * @param {string} description Link Description
   * @param {string} url Link URL
   */
  constructor(category, title, description, url) {

    /**
     * Link category name
     * @type {string}
     */
    this.category = category;

    /**
     * Link title
     * @type {string}
     */
    this.title = title;

    /**
     * Link description
     * @type {string}
     */
    this.description = description;

    /**
     * Fully-qualified and escaped Link URL
     * @type {string}
     */
    this.url = url;

  }

}


module.exports = Link;