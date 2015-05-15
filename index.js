require('./lib/bootstrap');

var application;

global.application = application = require('./lib/Application');

application.loadControllers();

module.exports = application;
