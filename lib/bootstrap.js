global.path = require('path');
global.cwd 	= process.cwd();
global.fs 	= require('fs');

var configFile = path.join(global.cwd, '/config/config.js');

if (fs.existsSync(configFile)) {
  global.CONFIG = require(configFile);
} else {
  console.error('Create ./config/config.js first!');
  process.exit();
}

// *************************************************************************
//                        Cobalt Logger
// *************************************************************************
if (!fs.existsSync('./log')) {
    fs.mkdirSync('./log', 0744);
}

global.logger = require('./logger');

require('neon');
require('neon/stdlib');
require('thulium'); // Ultra fast templating engine. See https://github.com/escusado/thulium

require('./RouteMapper/index.js');

require('krypton-orm');

// *************************************************************************
//                        Error monitoring for neon
// *************************************************************************
if (CONFIG.enableLithium) {
  require('./vendor/lithium');
}
