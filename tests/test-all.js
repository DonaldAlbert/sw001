'use strict';

var fs = require('fs')
    , async = require('async')
    , p = require('path')
    , child = require('child_process')
    , testRoot = __dirname
    , scriptList = [];


testRoot = '/home/bitspike/nodejs-projects/cms/tests';
scanFolder(testRoot);
runScripts(); //add parameter true to run all test as a sing script.

//require('./generator-manager.js');


function appendScript(path) {
    scriptList.push(path);
}


function runScripts(asOne) {
    if( asOne === undefined ) asOne = false;
    
    async.eachSeries(scriptList, function iterator(path, done) {
        if( path.endsWith('.js') && path !== __filename ) {
            if( asOne ) {
                require(path);
                done();
            }
            else {
                child.spawn('node', ['--harmony', path], { stdio: 'inherit' })
                    .on('close', (exitCode) => { done(); });
            }
        }
    });
}


function scanFolder(path) {
    var contents = fs.readdirSync(path).map( function(value) {
        return p.resolve(path, value);
    });

    trampoline( () => appendScripts(contents, 0, false) );
}


function appendScripts(contents, index, foldersRead) {
    if( foldersRead ) {
        if( index >= contents.length ) { return; }

        if( fs.statSync(contents[index]).isFile() )
            appendScript(contents[index]);
    }
    else {
        if( index >= contents.length ) {
            return function() { return appendScripts(contents, 0, true); };
        }

        if( fs.statSync(contents[index]).isDirectory() )
            scanFolder(contents[index]);
    }

    return function() { return appendScripts(contents, index+1, foldersRead); };
}

function trampoline(fn) {
  while(fn && typeof fn === 'function') {
    fn = fn()
  }
}
