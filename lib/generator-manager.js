'use strict';

/**
 * 
 * @module generator-manager
 */


var compose = require('koa-compose');


module.exports.GeneratorManager = GeneratorManager;
module.exports.OrderedMap = OrderedMap;


/**
 *
 * @class GeneratorManager
 * 
 * @property {number} count - Readonly. The number of generators
 *  currently managed.
 * @property {GeneratorManager} generators - The map the holds the
 *  generators.
 */
function GeneratorManager() {
    this.generators = new module.exports.OrderedMap();


    // count Property
    Object.defineProperty(this,
    'count', {
        get: function () { return this.generators.values.length; }
    });

    /**
     * This method created and binds the callback function to the
     * generators map variable.
     *
     * @private
     */
    this._createCallback = function() {
        var t = this;
        return function *(next) {
            var composition = compose(t.generators.values);
            yield *composition.call(this, next);
        }
    };

    /**
     * The function to 'use' with koa to let it know about the managed
     * generators.
     * 
     * @member {function} 
     */
    this.callback = this._createCallback();

    /**
     * This method will remove all the generators from the manager.
     */
    this.clear = function() {
        this.generators.clear();
    };

    /**
     * Adds a generator which will execute before all the ones that are
     * already added. If an other generator with the same name already
     * exist it will be replaced.
     *
     * @param {function} generator - A generator function that will be
     *  used to serve koa requests.
     * @param {string} [name] - A name for future reference to the
     *  generator (e.g. to remove it). If not set the 
     */
    this.append = function(generator, name) {
        if( typeof(name) === 'string' ) {
            this.generators.push(generator, name);
        }
        else {
            this.generators.push(generator);
        }
    };

    /**
     * Adds a generator which will execute after all the ones that are
     * already added. If an other generator with the same name already
     * exist it will be replaced.
     *
     * @param {function} generator - A generator function that will be
     *  used to serve koa requests.
     * @param {string} [name] - A name for future reference to the
     *  generator (e.g. to remove it). If not set the 
     */
    this.prepend = function(generator, name) {
        if( typeof(name) === 'string' ) {
            this.generators.unshift(generator, name);
        }
        else {
            this.generators.unshift(generator);
        }
    };

    /**
     *
     * @param {string|function} selector - The generator that we want
     *  remove or its name.
     * @returns {boolean} True if an item was removed successfully,
     *  False otherwise.
     */
    this.remove = function(selector) {
        return this.generators.remove(selector);
    }
};




/**
 * @class OrderedManp
 */
function OrderedMap() {
    this.keys = [];
    this.values = [];

    /**
     * Use this method to remove all the data form the map.
     */
    this.clear = function() {
        this.keys = [];
        this.values = [];
    }

    /**
     * Add an item at the end of the map. If an item of that name
     * already exists in the map, the old item will be replaced.
     * 
     * @param {mixed} value - The item we want to store.
     * @param {string} [key] - The name we want to assosiate with our
     *  item. If not defined the item will use null as a key.
     */
    this.push = function(value, key) {
        if( key ) {
            var index = this.keys.indexOf(key);
            if( index != -1 ) {
                this.values[index] = value;
            }
            else {
                this.keys.push(key);
                this.values.push(value);
            }
        }
        else {
            this.keys.push(null);
            this.values.push(value);
        }
    }

    // this.pop //TODO


    /**
     * Add a new item at the beginning of the map. If an item of that
     * name already exists in the map, the old item will be replaced.
     * 
     * @param {mixed} value - The item you want to store in the map.
     * @param {string} [key] - The key that we want to assisiate the
     *  value with.
     */
    this.unshift = function(value, key) {
        if( key ) {
            var index = this.keys.indexOf(key);
            if( index != -1 ) {
                this.values[index] = value;
            }
            else {
                this.keys.unshift(key);
                this.values.unshift(value);
            }
        }
        else {
            this.keys.unshift(null);
            this.values.unshift(value);
        }
    }
    
    // this.shift //TODO

    // this.append //TODO: Add item after an other item

    // this.prepend //TODO: Add item before an other item

    /**
     * Remove an item either by key or by reference.
     *
     * @param {string|object} selector - Either the key of the item we
     *  want to remove or its value.
     * @returns {boolean} True if an item was removed.
     */
    this.remove = function(selector) {
        var index;
        if( typeof selector === 'string' )
            index = this.keys.indexOf(selector);
        else
            index = this.values.indexOf(selector);
        
        if( index !== -1 ) {
            this.keys.splice(index, 1);
            this.values.splice(index, 1);
            return true;
        }

        return false;
    }
}
