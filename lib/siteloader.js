'use strict';

var fs = require('fs')
    , async = require('async')
    , cms = require('./system')
    , _SITES_DIR = 'sites' // Relative to cms's root
    , settings;



module.exports = new function () {
    this.readSites = function(siteRoot, options) {
        fs.readdir(cms.localFile(_SITES_DIR), function(err, contents) {
            if( err ) {
                console.error('Could not find the `' + _SITES_DIR + '` directory.');
                console.error(err);
                process.exit();
            }
    
            var settings = []
                , settingsPath
                , siteName;
            for( var path of contents ) {
                siteName = path;
                path = cms.localFile('sites/'+path);
                settingsPath = settingsFile(path);
                fs.exists(settingsPath, function(exists) {
                    if( exists ) {
                        console.info(settingsPath + ' found: \x1b[92m \x1b[1m' + exists + '\x1b[0m');
                        settings[siteName] = require(settingsPath);
                        console.log(settings);
                    }
                    else {
                        console.log(settingsFile(settingsPath) + ' found: \x1b[91m \x1b[1m' + exists + '\x1b[0m');
                    }
                });
            }

            return settings;
        }); 
    };
};


function settingsFile(siteRoot) {
    return siteRoot + '/settings.js';
}
