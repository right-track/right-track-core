'use strict';

/**
 * Right Track Date Time
 * ---------------------
 * This class handles the various representations of dates and
 * times used by the GTFS Spec and the Right Track Library and
 * the various transformations between them.
 *
 * Time Formats
 * - _string_ hh:mm aa (1:30 PM) | **Human Readable Time**
 * - _string_ HH:mm:ss (13:30:00) | **GTFS Time**
 * - _string_ HH:mm (13:30)
 * - _string_ HHmm (1330)
 * - _int_ seconds since midnight (7:00 am = 25200) | **Time Seconds**
 *
 * Date Formats
 * - _int_ yyyymmdd (20170930) | **Date Integer**
 *
 * **package:** core.utils.DateTime
 *
 * @class
 */
class DateTime {

  /**
   * Right Track Date Time Constructor
   * @constructor
   * @param {(string|int)} time String or Integer representation of the time.  Can be in one
   * of the following formats: 1) HH:mm:ss 2) HH:mm 3) HHmm 4) h:mm aa or 5) an integer of the
   * number of seconds since midnight (ex 7:00 am = 25200)
   * @param {int} date The date of the DateTime in the format yyyymmdd
   */
  constructor(time, date) {

    /**
     * INTERNAL REPRESENTATION
     * time = {int} number of seconds since midnight
     * date = {int} date in the format of yyyymmdd
     */


    // ==== PARSE THE TIME ==== //

    // Time Format: integer with seconds in day
    if ( Number.isInteger(time) ) {

      // Check to make sure time int is within reasonable range
      if ( time >= 0 && time <= 115200 ) {
        this.time = time;
      }

      // Time int is not within reasonable range of 0 --> 32 hours
      else {
        throw new Error('DATETIME ERROR: Time Integer is out of bounds!');
      }

    }

    // Time Format: string
    else {

      // Time format: hh:mm aa
      let matches = time.match('((1[0-2]|0?[1-9]):([0-5][0-9])\\s?([AaPp][Mm]))');
      if ( null !== matches && matches.length > 0 ) {
        let h = parseInt(time.split(':')[0]);
        let m = parseInt(time.split(':')[1].substr(0, 2));
        let aa = time.slice(-2).toLowerCase();

        // Reset h to 0 for 12 AM
        if ( aa === 'am' && h === 12 ) {
          h = 0;
        }

        // Add 12 to h for pm
        else if ( aa === 'pm' && h !== 12 ) {
          h = h + 12;
        }

        this.time = h*3600 + m*60;
      }

      // Time Format: HH:mm:ss OR HH:mm
      else if ( time.indexOf(':') > -1 ) {
        let parts = time.split(':');

        // When there is either 1 or 2 colons
        if ( parts.length === 3 || parts.length === 2 ) {
          let h = parseInt(parts[0]);
          let m = parseInt(parts[1]);
          let s = parts.length === 3 ? parseInt(parts[2]) : 0;

          // Check to make sure time parts are within a reasonable range
          if (Number.isInteger(h) && h >= 0 && h <= 32 &&
            Number.isInteger(m) && m >= 0 && m <= 59 &&
            Number.isInteger(s) && s >= 0 && s <= 59) {
            this.time = h*3600 + m*60 + s;
          }
          else {
            throw new Error('DATETIME ERROR: Could not parse the time. h=' + h + ', m=' + m + ', s=' + s);
          }

        }

        // Time format: incorrect with colon
        else {
          throw new Error('DATETIME ERROR: Could not parse the time: ' + time);
        }

      }

      // Time Format: HHmm
      else if ( time.length === 4 ) {

        // Parse hours and minutes from time
        let h = parseInt(time.substring(0, 2));
        let m = parseInt(time.substring(2, 4));

        // Check to make sure time parse are numbers within a reasonable range
        if ( Number.isInteger(h) && h >= 0 && h <= 32 &&
           Number.isInteger(m) && m >= 0 && m <= 59 ) {
          this.time = h*3600 + m*60;
        }
        else {
          throw new Error('DATETIME ERROR: Could not parse the time. h=' + h + ', m=' + m);
        }

      }

      // Time Format: incorrect
      else {
        throw new Error('DATETIME ERROR: Could not parse the time: ' + time);
      }

    }



    // ==== PARSE THE DATE ==== //


    // Make sure the date is within a reasonable range
    if ( date >= 19700101 && date <= 21001231 ) {
      this.date = date;
    }
    else {
      throw new Error('DATETIME ERROR: Date is not within the expected range. date=' + date);
    }

  }











  // ==== MUTATORS ==== //

  /**
   * Add or Subtract the specified number of days to the DateTime's date
   * @param delta +/- number of days to add
   */
  deltaDays(delta) {
    let s = this.date.toString();
    let y = s.substr(0, 4);
    let m = s.substr(4, 2);
    let d = s.substr(6, 2);
    let jd = new Date(y, m-1, d);

    jd.setDate(jd.getDate() + delta);

    y = jd.getFullYear();
    m = jd.getMonth()+1;
    d = jd.getDate();

    if ( m < 10 ) {
      m = '0' + m;
    }
    if ( d < 10 ) {
      d = '0' + d;
    }

    this.date = parseInt('' + y + m + d);
  }


  deltaMins(delta) {
    let h = Math.floor(this.time/3600);
    let m = Math.floor((this.time%3600)/60);
    let s = Math.floor((this.time%3600)%60);

    let hDelta = Math.floor(delta/60);
    let mDelta = Math.floor(delta%60);

    h = h + hDelta;
    m = m + mDelta;

    this.time = h*3600 + m*60 + s;
  }




  // ==== TIME GETTERS ==== //

  /**
   * Get the GTFS Spec time representation (HH:mm:ss)
   * @returns {string} GTFS Time (HH:mm:ss)
   */
  getTimeGTFS() {
    let h = Math.floor(this.time/3600);
    let m = Math.floor((this.time%3600)/60);
    let s = Math.floor((this.time%3600)%60);

    // Pad with leading 0s
    if ( h < 10 ) {
      h = '0' + h;
    }
    if ( m < 10 ) {
      m = '0' + m;
    }
    if ( s < 10 ) {
      s = '0' + s;
    }

    return h + ':' + m + ':' + s;
  }

  /**
   * Get the time in seconds since midnight
   * @returns {int} time integer in seconds
   */
  getTimeSeconds() {
    return this.time;
  }

  /**
   * Get the human readable time (12 hr with AM/PM)
   * @returns {string} human readable time
   */
  getTimeReadable() {
    let h = Math.floor(this.time/3600);
    let m = Math.floor((this.time%3600)/60);
    let s = Math.floor((this.time%3600)%60);


    // Pad Minutes with 0s
    if ( m < 10 ) {
      m = '0' + m;
    }


    // 12 AM
    if ( h === 0 ) {
      return '12:' + m + ' AM';
    }

    // AM
    else if ( h < 12 ) {
      return h + ':' + m + ' AM';
    }

    // 12 PM
    else if ( h === 12 ) {
      return h + ':' + m + ' PM';
    }

    // PM
    else if ( h < 24 ) {
      h = h - 12;
      return h + ':' + m + ' PM';
    }

    // Next day
    else if ( h === 24 ) {
      h = 12;
      return h + ':' + m + ' AM';
    }

    // Next Day
    else if ( h > 24 ) {
      h = h - 24;
      return h + ':' + m + ' AM';
    }

    // Shouldn't reach here
    else {
      return this.getTimeGTFS();
    }

  }


  // ==== DATE GETTERS ==== //

  /**
   * Check if the date is set
   * @returns {boolean} true if the date is set
   */
  isDateSet() {
    return this.date !== 19700101;
  }

  /**
   * Get the integer representation of the date (yyyymmdd)
   * @returns {int} date integer (yyyymmdd)
   */
  getDateInt() {
    return this.date;
  }

  /**
   * Get the full name of the weekday of the date (monday, tuesday, etc)
   * @returns {string} day of week
   */
  getDateDOW() {
    let dow = new Array(7);
    dow[0] = 'sunday';
    dow[1] = 'monday';
    dow[2] = 'tuesday';
    dow[3] = 'wednesday';
    dow[4] = 'thursday';
    dow[5] = 'friday';
    dow[6] = 'saturday';

    let s = this.date.toString();
    let y = s.substr(0, 4);
    let m = s.substr(4, 2);
    let d = s.substr(6, 2);
    let jd = new Date(y, m-1, d);

    return dow[jd.getDay()];
  }

  /**
   * Get a String representation of the DateTime to be
   * used as a MySQL DateTime
   * @returns {string} MySQL DateTime String
   */
  toMySQLString() {
    let str = '';
    if ( this.date === 19700101 ) {
      console.warn('DATE NOT SET');
    }

    // Set date
    let s = this.date.toString();
    let y = s.substr(0, 4);
    let m = s.substr(4, 2);
    let d = s.substr(6, 2);
    str = str + y + '-' + m + '-' + d + ' ';

    // Set time
    str = str + this.getTimeGTFS();

    return str;
  }

  /**
   * Get a String representation of the DateTime to be used
   * in HTTP Headers
   * @returns {string} HTTP Header String
   */
  toHTTPString() {
    let str = '';

    // Get date
    let s = this.date.toString();
    let y = s.substr(0, 4);
    let m = s.substr(4, 2);
    let d = s.substr(6, 2);

    // Create JS Date
    let date = new Date(y, m-1, d);

    // Get Time
    let hour = Math.floor(this.time/3600);
    let mins = Math.floor((this.time%3600)/60);
    let secs = Math.floor((this.time%3600)%60);

    // Next day
    if ( hour >= 24 ) {
      hour = hour - 24;
      date.setDate(date.getDate()+1);
    }

    // Set Time
    date.setHours(hour);
    date.setMinutes(mins);
    date.setSeconds(secs);


    return date.toUTCString();
  }

  /**
   * Get a String representation of the DateTIme
   * @returns {string} string of DateTime
   */
  toString() {
    let str = '';
    if ( this.date !== 19700101 ) {
      let s = this.date.toString();
      let y = s.substr(0, 4);
      let m = s.substr(4, 2);
      let d = s.substr(6, 2);

      str = str + y + '-' + m + '-' + d + ' ';
    }
    str = str + '@ ' + this.getTimeGTFS();
    return str;
  }

}




/**
 * DateTime Factory: date and time of now
 * @returns {DateTime} DateTime
 */
DateTime.now = function() {
  let jd = new Date();

  // Construct Date
  let y = jd.getFullYear();
  let m = jd.getMonth() + 1;
  let d = jd.getDate();
  if ( m < 10 ) {
    m = '0' + m;
  }
  if ( d < 10 ) {
    d = '0' + d;
  }
  let date = parseInt('' + y + m + d);

  // Construct Time
  let h = jd.getHours();
  let min = jd.getMinutes();
  let sec = jd.getSeconds();
  if ( h < 10 ) {
    h = '0' + h;
  }
  if ( min < 10 ) {
    min = '0' + min;
  }
  if ( sec < 10 ) {
    sec = '0' + sec;
  }
  let time = h + ':' + min + ':' + sec;

  return new DateTime(time, date);
};


/**
 * DateTime Factory: with time and date
 * @param {string} time Time
 * @param {int} date Date
 * @returns {DateTime} DateTime
 */
DateTime.create = function(time, date) {
  return new DateTime(time, date);
};


/**
 * DateTime Factory: with JavaScript Date
 * @param {Date} date JavaScript Date
 */
DateTime.createFromJSDate = function(date) {
  // TODO
};


/**
 * DateTime Factory: with DateTime
 * @param {DateTime} datetime DateTime to clone
 * @returns {DateTime} DateTime
 */
DateTime.createFromDateTime = function(datetime) {
  return new DateTime(datetime.time, datetime.date);
};

/**
 * DateTime Factory: with time
 * @param {string} time Time
 * @returns {DateTime} DateTime
 */
DateTime.createFromTime = function(time) {
  return new DateTime(time, 19700101);
};

/**
 * DateTime Factory: with date
 * @param {int} date Date
 * @returns {DateTime} DateTime
 */
DateTime.createFromDate = function(date) {
  return new DateTime('00:00:00', date);
};


module.exports = DateTime;
