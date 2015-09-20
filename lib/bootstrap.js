'use strict';

/**
* Bootstraping the CMS.
* @module bootstrap
*/

var http = require('http')
    , router = require('koa-router')()
    , vhosts = require('koa-vhost')
    , util = require('util')
    , pg = require('pg-native')
    , co = require('co')
    , cms = require('./system')
    , loader = require('./siteloader');
    
module.exports = new function () {
    this._init = function *(ports) {
        try {
            var portsOk = yield cms.checkPorts(ports);
        } catch (err) {
            console.error('There was a problem during port availability check.');
            console.error(err);
            return;
        }
        
        yield cms.loadSites(true);

        yield cms.startServer(ports);

        //cms.stopServer().then(()=>{console.log('closing done');});
    };
    
    
    /**
    * @param {number[]} The port on which the server will be listening.
    */
    this.start = function(ports) {
        // Condition ports argument
        if( ports == undefined )
            ports = [80];
      else if( !Array.isArray(ports) )
        ports = [ports];
      
        co(this._init(ports));
    };
    
};
