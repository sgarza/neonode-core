require('./lib/bootstrap');

global.application = require('./lib/Application');

application.loadControllers();