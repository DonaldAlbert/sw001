'use strict';

/**
* Code responsible for handling the site configurations of the CMS.
*
* @module site-app-manager
*/


var koa = require('koa')
    , vhost = require('koa-vhost')
    , router = require('koa-router')
    , compose = require('koa-compose');


module.exports.SiteAppManager = SiteAppManager;



/**
 * Class managing the generators, applications and vhosts for a site.
 *
 * @class SiteAppManager
 * @param {string} path - The site's directory
 */
function SiteAppManager(site) {
    this._allwaysCallNext = function(generator) {
        return function *(next) {
            yield *generator.call(this, function*(){});
            yield *next;
        };
    };

    this._getCallbackNoHost = function() {
        var generators = [this._router.routes()];
        generators = this._preGenerators
            .join(generators)
            .join(this._postGenerators);
        
        return compose(generators);
    }

    this._getCallbackHosts = function() {
        var hosts = this._site.settings.hosts
            , app = koa()
            , vhostConfig = [];
        
        vhostConfig = hosts.map((host) => {
            return {host: host, app: app};
        });
        this._preGenerators.forEach((gen) => {app.use(gen);} );
        this.app.use(this._router.routes());
        this._postGenerators.forEach((gen) => {app.use(gen);} );

        return this._allwaysCallNext(vhost(vhostConfig));
    }

    this.getCallback = function() {
        if( this._site.settings.hosts === '*' )
            return this._getCallbackNoHost();
        else
            return this._getCallbackHosts();
    }

    

    this._site = site;

    this._router = router();

    this.preGenerators = [];

    this.postGenerators = [];
}
