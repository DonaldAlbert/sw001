'use strict';

var gm = require('../lib/generator-manager')
    , util = require('util')
    , koa = require('koa')
    , qio = require('q-io/http')
    , tape = require('tape')
    , async = require('async');



tape('-GeneratorManager - Callback Order Validation -- ' + __filename, function(t) {
    var manager = new gm.GeneratorManager()
        , app = koa()
        , order = 1;
    
    function *f1(next) {
        t.equal(order++, 1, 'f1 generator called first.');
        yield *next;
    }

    function *f2(next) {
        t.equal(order++, 2, 'f2 generator called second.');
        this.body = 'test html body';
        yield *next;
    }

    function *f3(next) {
        t.equal(order++, 3, 'f3 generator called third.');
        yield *next;
    }

    t.plan(4);
    
    manager.append(f1);
    app.use(manager.callback);
    manager.append(f2);
    app.use(f3);

    var server = app.listen(8383);

    qio.read('http://127.0.0.1:8383').then(
        function(value) {
            t.equal(value.toString(), 'test html body', 'Testing "this" keyword content.');
            server.close();
            t.end();
        }
        , function(err){
            t.fail('Temporary test server could not be reached.');
            console.log(err);
            server.close();
            t.end();
        }
    );
});

tape('-GeneratorManager - Callback Removal Validation -- ' + __filename, function(t) {
    var manager = new gm.GeneratorManager()
        , app = koa()
        , order = []
        , server;
    
    function *f1(next) {
        order.push(1);
        yield *next;
    }

    function *f2(next) {
        order.push(2);
        this.body = 'test html body';
        yield *next;
    }

    function *f3(next) {
        order.push(3);
        yield *next;
    }

    //t.plan(4);
    
    manager.append(f1);
    manager.append(f2);
    manager.append(f3);
    app.use(manager.callback);

    server = app.listen(8383);

    async.series([
        function(done) {
            qio.read('http://127.0.0.1:8383').then(
                function(value) {
                    t.deepEqual(order, [1,2,3], 'Testing "this" keyword content.');
                    manager.remove(f1);
                    done(null, 1);
                }
                , function(err){
                    t.fail('Temporary test server could not be reached.');
                    done(err);
                }
            );
        }, 
        function(done) {
            qio.read('http://127.0.0.1:8383').then(
                function(value) {
                    t.deepEqual(order, [1,2,3,2,3], 'Testing "this" keyword content.');
                    done(null, 1);
                }
                , function(err){
                    t.fail('Temporary test server could not be reached.');
                    done(err);
                }
            );
        }, 
    ]
    , function(err) {
        if( err ) {
            console.log(err);
        }
        
        server.close();
        t.end();
    });
});




tape('-OrderedMap - push -- ' + __filename, function(t) {
    var map = new gm.OrderedMap();

    var values = [{n:'value1'}, {n:'value2'}, {n:'value3'}, {n:'value4'}, {n:'value5'}, {n:'value6'}]
        , keys = [undefined, 'key2', 'key3', null, 'key5', undefined];

    for( var i = 0; i < values.length; i++ ) {
        map.push(values[i], keys[i]);
        t.deepEqual(map.values, values.slice(0,i+1), 'Pussing ' + i + '# item.');
        t.deepEqual(map.keys, keys.slice(0,i+1).map((v)=> (v === undefined) ? null : v), 'Pussing ' + i + '# item.');
    }
    
    t.end();
});

tape('-OrderedMap - unshift -- ' + __filename, function(t) {
    var map = new gm.OrderedMap();

    var values = [{n:'value1'}, {n:'value2'}, {n:'value3'}, {n:'value4'}, {n:'value5'}, {n:'value6'}]
        , keys = [undefined, 'key2', 'key3', null, 'key5', undefined];

    for( var i = 0; i < values.length; i++ ) {
        map.unshift(values[i], keys[i]);
        t.deepEqual(map.values, values.slice(0,i+1).reverse(), 'Pussing ' + i + '# item.');
        t.deepEqual(map.keys, keys.slice(0,i+1).reverse().map((v)=> (v === undefined) ? null : v), 'Pussing ' + i + '# item.');
    }
    
    t.end();
});

tape('-OrderedMap - push/unshift -- ' + __filename, function(t) {
    var map = new gm.OrderedMap();

    var values = [{n:'value1'}, {n:'value2'}, {n:'value3'}, {n:'value4'}, {n:'value5'}, {n:'value6'}]
        , keys = [undefined, 'key2', 'key3', undefined, 'key5', undefined]
        , actionSequence = ['push', 'unshift', 'push', 'unshift', 'push', 'unshift']
        , valuesMonitor = []
        , keysMonitor = [];

    for( var i = 0; i < values.length; i++ ) {
        switch( actionSequence ) {
            case 'unshift':
                map.unshift(values[i], keys[i]);
                valuesMonitor.unshift(values[i]);
                keysMonitor.unshift(keys[i]);
                break;
            case 'push':
                map.push(values[i], keys[i]);
                valuesMonitor.push(values[i]);
                keysMonitor.push(keys[i]);
                break;
        }
    }
    
    t.deepEqual(map.values, valuesMonitor, 'Final values check.');
    t.deepEqual(map.keys, keysMonitor, 'Final keys check.');

    t.end();
});

tape('-OrderedMap - push/unshift/clear -- ' + __filename, function(t) {
    var map = new gm.OrderedMap();

    var values = [{n:'value1'}, {n:'value2'}, {n:'value3'}, {n:'value4'}, {n:'value5'}, {n:'value6'}]
        , keys = [undefined, 'key2', 'key3', undefined, 'key5', undefined]
        , actionSequence = ['push', 'unshift', 'push', 'unshift', 'push', 'unshift']
        , valuesMonitor = []
        , keysMonitor = [];

    for( var i = 0; i < values.length; i++ ) {
        switch( actionSequence ) {
            case 'unshift':
                map.unshift(values[i], keys[i]);
                valuesMonitor.unshift(values[i]);
                keysMonitor.unshift(keys[i]);
                break;
            case 'push':
                map.push(values[i], keys[i]);
                valuesMonitor.push(values[i]);
                keysMonitor.push(keys[i]);
                break;
        }
    }

    map.clear();
    
    t.deepEqual(map.values, valuesMonitor, 'Final values check.');
    t.deepEqual(map.keys, keysMonitor, 'Final keys check.');

    t.end();
});

tape('-OrderedMap - push/unshift/remove -- ' + __filename, function(t) {
    var map = new gm.OrderedMap();

    var values = [{n:'value1'}, {n:'value2'}, {n:'value3'}, {n:'value4'}, {n:'value5'}, {n:'value6'}]
        , keys = [undefined, 'key2', 'key3', undefined, 'key5', undefined]
        , baseline1 = [2, 0, 1]
        , baseline2 = [2, 0]
        , baseline3 = [4, 1, 2, 0, 5]
        , baseline4 = [4, 1, 2, 5]
        , baseline5 = [4, 1, 2]
        , baseline6 = [4, 1];

    function check(baseline, message) {
        var baselineKeys = baseline.map((value)=>(keys[value] === undefined) ? null : keys[value])
            , baselineValues = baseline.map((value)=>values[value]);

        t.deepEqual(map.values, baselineValues, message + ' - values');
        t.deepEqual(map.keys, baselineKeys, message + ' - keys');
    }

    
    map.unshift(values[0], keys[0]);
    map.push(values[1], keys[1]);
    map.unshift(values[2], keys[2]);
    check(baseline1, 'Check initial map state.');
    
    t.true(map.remove(keys[1]), 'Removal return check');
    check(baseline2, 'Check map state after first removal.');
    
    map.unshift(values[1], keys[1]);
    map.push(values[5], keys[5]);
    map.unshift(values[4], keys[4]);
    check(baseline3, 'Check map state new insertions.');

    map.remove(values[0]);
    check(baseline4, 'Check map state after secondary removal by reference.');
    
    t.true(map.remove(values[5]), 'Removal return check');
    check(baseline5, 'Check map state after secondary removal by reference.');
    
    t.true(map.remove(keys[2]), 'Removal return check');
    check(baseline6, 'Check map state after secondary removal by name.');
    
    t.false(map.remove('sadfasd'), 'Removal return check');
    t.false(map.remove({a:123}), 'Removal return check');
    check(baseline6, 'Check map state after removal of non existsing item.');

    t.end();
});


tape('-GeneratorManager - Size property -- ' + __filename, function(t) {
    var manager = new gm.GeneratorManager()
        , app = koa()
        , order = []
        , server;
    
    function *f1(next) {
        order.push(1);
        yield *next;
    }

    function *f2(next) {
        order.push(2);
        this.body = 'test html body';
        yield *next;
    }

    function *f3(next) {
        order.push(3);
        yield *next;
    }

    //t.plan(4);
    
    t.equal(manager.count, 0, 'Initial count check.')
    manager.append(f1);
    t.equal(manager.count, 1, 'Count check.')
    manager.remove(f1);
    t.equal(manager.count, 0, 'Count check.')
    manager.append(f2);
    t.equal(manager.count, 1, 'Count check.')
    manager.append(f3);
    t.equal(manager.count, 2, 'Final count check.')

    
    t.end();
});
