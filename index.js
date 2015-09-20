'use strict';


var bootstraper = require('./lib/bootstrap')
    , async = require('async')
    , s = require('./lib/site');


bootstraper.start([8383]);


/*
for( var i=0; i<256; i++)
    console.log(i+': \x1b['+i+'mColor\x1b[0m');

Changing color on console
    1: Bold
    3: Inverse
    4: Underline
    90-97: Fore color
    100-107: Back color

    console.info('\x1b[92m \x1b[1m Green Bold: \x1b[0m');
    console.log('\x1b[91m \x1b[1m Red Bold: \x1b[0m');
*/

/*
var koa = require('koa')
    , app = koa()
    , gens = {};


gens['123'] = function * (next) {
    this.body = 'gen1 generator called';
    yield Promise.resolve(5);
}

gens['gen2'] = function * (next) {
    this.body = 'gen2 generator called - continuing...';
    yield next;
}

gens['gen3'] = function * (next) {
    this.body = 'gen3 generator called'; 
}


app.use(function *(next){
    switch( this.path ) {
        case '/a':
            yield gens['123'](next);
            break;
        case '/b':
            yield gens['gen2'](next);
            break;
        case '/c':
            yield gens['gen3'](next);
            break;
        default:
            yield next;
    }
});

app.use(function *(next) {
    if( this.body )
        this.body += '\ndefault generator called';
    else
        this.body = 'default generator called';
});

app.listen(8383);
*/


/*
var koa = require('koa')
    , router = require('koa-router')
    , vhosts = require('koa-vhost');

var mainapp = koa()
    , vhost1App = koa()
    , vhost2App = koa();


function nextAllways(vhost) {
    return function *(next) {
        yield *vhost.call(this, function*(){});
        yield *next;
    };
}



mainapp.use(function *(next) {
    this.body = '1,';
    yield *next;
});
mainapp.use(nextAllways(vhosts('www.google.com', vhost1App)));
mainapp.use(nextAllways(vhosts('www.microsoft.com', vhost2App)));
mainapp.use(function *(next) {
    this.body += '4,';
    yield *next;
});

vhost1App.use(function *(next) {
    this.body += '2,';
    yield *next;
});

vhost2App.use(function *(next) {
    this.body += '3,';
    //yield *next;
});



mainapp.listen(8383);

/*
*/
