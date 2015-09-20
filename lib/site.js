'use strict';

/**
* Code responsible for handling the site configurations of the CMS.
*
* @module site
*/


var fs = require('fs')
    , async = require('async')
    , appManager = require('./site-app-manager');


module.exports.Site = Site;



/**
 * Class representing a site served by the CMS.
 *
 * @class Site
 * @param {string} path - The site's directory
 */
function Site(path) {
    /**
     * The name of the file where the settings of the site are found.
     * @constant {string}
     */
    this.SETTINGS_FILENAME = 'settings.js';

    /**
     * 
     */
    this._httpGenerator = null;

    /**
     * The name of the site. It is extracted from the last part of the
     * path passed to the constructor.
     * @member {string}
     */
    this.name = path.slice(path.lastIndexOf('/'));

    /**
     * The root of the site's files.
     * @member {string}
     */
    this.siteRoot = path;

    /**
     * The absolute path of the settings file for the site.
     * @member {string}
     * @default this.siteRoot+'/'+this.SETTINGS_FILENAME
     */
    this.settingsFile = this.siteRoot+'/'+this.SETTINGS_FILENAME;

    /**
     * An object that holds all the settings of the site. This object
     * is loaded from the settings file.
     * @member {object}
     */
    this.settings = {};

    this._loadSettings = function() {
        var exists;
            
        console.info('Creating ' + this.name);
        this.settings = require(this.settingsFile);
        console.info(this.settingsFile + ' found: \x1b[92m \x1b[1m ture \x1b[0m');
    };

    this._init = function() {
        this._loadSettings();
        this._httpGenerator = new appManager.SiteAppManager(this);
        
    };

    /**
     * This method returns a generator callback to be used in a koa
     * application.
     * 
     * @returns {function} A generator callback.
     */
    this.getCallback = function() {
        return this._httpGenerator.getCallback();
    };

    // Initialization code.
    this._init();
}
