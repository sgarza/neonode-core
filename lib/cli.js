#!/usr/bin/env node
var path = require('path');
var fs = require('fs');

process.on('SIGINT', function() {
  process.exit();
});

var localNeonode =  path.join(process.cwd(), 'node_modules' 'neonode-core', 'lib', 'neonode.js');

var neonode, Neonode;

var isLocal = false;

if (fs.existsSync(localNeonode)) {
  Neonode = require(localNeonode);
  isLocal = true;
} else {
  Neonode = require('./neonode');
}

neonode = new Neonode({isLocal : isLocal});
