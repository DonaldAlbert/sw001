'use strict';

/**
    Exports the main object of the CMS. This is the object that holds the primary
    parts of the system (e.g. the Koa's app object).
    
    @module system
*/

var koa = require('koa')
    , http = require('http')
    , fs = require('fs')
    , site = require('./site')
    , generatorManager = require('./generator-manager')
    , app = koa()
    , i = 10;


module.exports = {
    /**
    * The root folder of the cms.
    * 
    * @member {string}
    */
    root: __dirname + '/..',

    /**
     * The folder, relative to the cms's root, where the sites served
     * by the cms reside.
     *
     * @member {string}
     */
    sitesFolder: 'sites',
    
    /**
    * The koa application instance.
    * @member {object}
    */
    app: app,

    /**
     * 
     */
    activeGenerators: {},
    
    /**
    * The sites that are served by the cms.
    * @member {Site}
    */
    sites: [],

    /**
     * This field holds the ports where the cms is listening.
     */
    ports: [],

    /**
     * The default ports to be used when the site does not define
     * it own ports.

    /**
     * This will function as a dictionary holding all the active http
     * server objects organized per port number.
     */
    servers: [],

    /**
     * Initialization function not supposed to be used out of this script.
     *
     * @private
     */
    _init: function() {
        this.siteGenerators = new generatorManager.GeneratorManager();
        this.app.use(this.siteGenerators.callback);
    },
    
    /**
    * Use this functiofn to get the absolute path of a file in the root cms folder.
    * @param {string} filename - The relative (to the cms's root) path of the file
    *   or directory we are interested in (e.g. 'sites/siteA'). 
    * @returns {string} The absolute path of the file/directory we are interested 
    *   in.
    */
    localFile: function(filename) { return this.root + '/' + filename; },
    
    /**
    *   Use this function to check if the ports of the local computer are ready to 
    *   listen.
    *   
    *   @param {number|number[]} The port number(s) to be checked.
    *   
    *   @returns {Promise} A promise that returns no value on sucess or the err
    *   object on error.
    */
    checkPorts: function(ports) {
        if( Array.isArray(ports) ) {
            var t = this
                , result;

            result = ports.map( t.checkPorts );
            
            return Promise.all(result);
        }
    
        var promise = new Promise( function(resolve, reject) {
            var net = require('net')
                , tester;
            
            tester = net.createServer()
                .once('error', function (err) { console.log('Port '+ports+': '+err); reject(err); }) // err.code != 'EADDRINUSE'
                .once('listening', function() {
                    tester.once('close', function() { console.log('Port '+ports+': ready.'); resolve(true); })
                    .close();
                })
                .listen(ports)
        });
        
        return promise;
    },
    
    /**
     * Use this function to read the configured sites and load them to
     * the sites field. That does not necessarilymeans that the loaded
     * sites will be served too. You must set the attach parameter to
     * do so.
     *
     * @param {boolean} [attach=false] - Set to true to also attach
     *  (serve) the site that will be loaded.
     * 
     * @returns {Promise} A promise that resolves when all the sites
     *  have been read.
     */
    loadSites: function(attach) {
        var siteFolder = this.localFile(this.sitesFolder)
            , t = this
            , returnPromise
            , siteName;

        attach = attach || false;

        returnPromise = new Promise(function(resolve, reject) {
            fs.readdir(siteFolder, function(err, contents) {
                if( err ) {
                    console.error('Could not find the `' + siteFolder + '` directory.');
                    console.error(err);
                    process.exit();
                }

                for( var path of contents ) {
                    try {
                        siteName = path;
                        path = siteFolder + '/' + path;
                        t.sites[siteName] = new site.Site(path);
                    } catch (err) {
                        console.log('Could not load ' + path);
                        console.log(err);
                    }
                }

                resolve();
            });
        });

        return returnPromise;
    },

    /**
     * Setup the main server and start serving the loaded sites.
     * loadSites should be called before this method.
     *
     * @returns {Promise}
     */
    startServer: function(ports) {
        var t = this
            , server;

        return this.stopServer()
            .then(function() {
                t.ports = ports;
                t.servers = ports.map( function(port) {
                    server = http.createServer(t.app.callback());
                    server.listen(port);
                    return server;
                });
            });
    },

    /**
     * Use this method to stop all running servers. If this method is
     * ran without any servers running, nothing will happen.
     *
     * @returns {Promise}
     */
    stopServer: function() {
        var partPromises = []
            , partPromise
            ,resultPormise;
    
        partPromises = this.servers.map(function(server) {
            return new Promise(function(resolve, reject) {
                server.close(resolve);
            });
        });

        this.ports = [];
        this.servers = [];

        if( partPromises.length ) {
            return Promise.all(partPromises);
        } else {
            return Promise.resolve();
        }
    },

    /**
     * Use this method to attach a site to a specific vhost/port.
     * TODO: Currenty the port parameter is ignored. Should be
     * implemented.
     *
     * @param {Site} site - The site that we would like to serve.
     * @param {string[]|regexp[]} vhost - The vhosts which the site will
     *  respond to.  Use "*" to make the site the default one.
     * @param {number|number[]} port - The ports where this site will be
     *  listening on. This will have to be one (or more) of the ports
     *  used when the cms was started.
     */
    attachSite: function(site) {
        this.activeGenerators.append(site.callback, site.name);
    },
    
};

module.exports._init();

