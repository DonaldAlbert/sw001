'use strict';

var tape = require('tape'),
    co = require('co'),
    serverLayer = require('../lib/server-layer');


tape('-Server Layer - Server start stop -- ' + __filename, function(t) {
    var layer = new serverLayer.Server();

    t.equal(layer.count, 0, 'Initial count check');

    t.end();
});

tape('-Plain Server - Server start stop -- ' + __filename, function(t) {
    var server = new serverLayer.Server(8383);

    co(function*(){
        try {
            yield server.start();
            yield server.stop();
            yield server.stop();
        } catch(e) {
            console.log(e);
        }
    });
    
    t.end();
});
