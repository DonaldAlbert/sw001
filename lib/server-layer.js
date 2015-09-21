'use strict';

var http = require('http'),
    https = require('https'),
    koa = require('koa'),
    async = require('async'),
    generatorManager = require('./generator-manager');



/**
 * 
 * @class ServerLayer
 */
class ServerLayer {
    constructor(defaultPorts, defaultSecure) {
        this.defaultPorts = defaultPorts | [];
        this.defaultSecurePorts = defaultSecure | [];
        this.portMaps = {}; // [port] -> [sites,...]
        this.servers = {}; // [port] -> [server]
    }

    /**
     * Use this method to check if the port settings of a site are
     * compatible to those of the other sites.
     * @private
     */
    _checkPortCompatibility(site) {
        var sitePorts = site.settings.ports
            , result = []
            , t = this;

        //Check site ports against eachother.
        sitePorts.plain.forEach(function(newPort){
            if( sitePorts.plain.indexOf(newPort) != -1 ) {
                result.push(newPort);
            }
        });

        //Check against default ports.
        sitePorts.plain.forEach(function(newPort){
            if( t.defaultSecurePorts.indexOf(newPort) != -1 ) {
                result.push(newPort);
            }
        });
        sitePorts.secure.forEach(function(newPort){
            if( t.defaultPorts.indexOf(newPort) != -1 ) {
                result.push(newPort);
            }
        });

        //Check against other site ports currently in use.
        sitePorts.plain.forEach(function(newPort){
            if( t.servers.keys().indexOf(newPort) != -1
                && t.servers[newPort] instanceof SecureServer
                && t.defaultSecurePorts.indexOf(newPort) != -1 ) {
                        result.push(newPort);
            }
        });
        sitePorts.secure.forEach(function(newPort){
            if( t.servers.keys().indexOf(newPort) != -1
                && t.servers[newPort] instanceof Server
                && t.defaultSecurePorts.indexOf(newPort) != -1 ) {
                        result.push(newPort);
            }
        });

        return result;
    }

    _mapSite(site) {
        var sitePorts = site.settings.ports
            t = this;

        //Map plain ports
        sitePorts.plain.foreach(function(port) {
            if( t.portMaps.hasOwnPorts(port) ) {
                if( t.portMaps.indexOf(site) === -1 )
                    t.portMaps[port].push(site);
            }
            else {
                t.portMaps[port] = [site];
            }
        });


        //Map secure ports
        sitePorts.secure.foreach(function(port) {
            if( t.portMaps.hasOwnPorts(port) ) {
                if( t.portMaps.indexOf(site) === -1 )
                    t.portMaps[port].push(site);
            }
            else {
                t.portMaps[port] = [site];
            }
        });
    }

    _unmapSite(site) {
        //TODO
    }

    _mountSite(site) {
        //TODO
    }

    _unmountSite(site) {
        //TODO
    }

    attachSite(site) {
        // Port compatibility check
        var portsOk = (this._checkPortCompatibility(site).length === 0);
        
        // Update port mapping
        this._mapSite(site);
        
        // Update corresponding server
    }

    detachSite(site) {

    }
}


class ServerManager {

}

/**
 * The Server class implements http server functionality for the server
 * layer of the cms. The cms uses one server object for each port of the
 * system.
 * 
 * @class Server
 */
class Server extends ServerManager {
    constructor(port) {
        super();
        this._koa = koa();
        this._server = http.createServer(this._koa.callback());
        this._siteManager = new generatorManager.GeneratorManager();
        this.serverType = 'plain';
        this.port = port;
        Object.defineProperty(this,
        'count', {
            get: () => this._siteManager.count
        });

        //Initialize
        this._koa.use(this._siteManager.callback);
    }

    /**
     * Use this method to append a site to the server. If a site with
     * the same name, already exists in the server, the old site will
     * be overwritten.
     * @param {Site} site - The site to be served by the server.
     */
    appendSite(site) {
        this._siteManager.push(site.getCallback(), site.name);
    }

    /**
     * Use this method to remove a site that already is being served by
     * the server. If that site does not exists, the method will exit
     * normally.
     * @param {Site} site - The site to be removed from the server.
     */
    removeSite(site) {
        this._siteManager.remove(site.name);
    }

    /**
     * This method starts the server asynchronously. If the server is
     * already running when this method is called, it will restart the
     * server.
     * @returns {Promise} - Returns a promise that will resolve when the
     *  server has started.
     */
    start() {
        var t = this;

        return new Promise( function(resolve, reject) {
            t.stop()
                .then( () => {
                    t._server.listen(port);
                    t._server.on('listening', resolve);
                    t._server.on('error', reject);
                }, reject);
        });
    }

    /**
     * Use this method to stop the server asynchronously.
     * @returns {Promise} - Returns a promise that will resolve when the
     *  server is closed.
     */
    stop() {
        var t = this,
            resultPromise;
    
        resultPromise = new Promise(function(resolve, reject) {
            t._server.close(resolve);
        });

        return resultPromise;
    }
}


class SecureServer extends ServerManager {
    constructor(port, options) {
        super();
    }

}


module.exports.ServerLayer = ServerLayer;
module.exports.Server = Server;
module.exports.SecureServer = SecureServer;
