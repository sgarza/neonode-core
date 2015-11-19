var glob     = require('glob');
var express  = require('express');
var http     = require('http');
var morgan   = require('morgan');

var Application = Class({}, 'Application')({
  prototype : {
    express           : null,
    http              : null,
    server            : null,
    io                : null,
    router            : null,
    env               : CONFIG.environment,

    controllers : {},
    models : {},

    init : function (){
      logger.log("Initializing Application");

      this.express = express;
      this.http = http;

      this.app = this.express();

      this.server = this.http.createServer(this.app);

      logger.log("Application Initialized");

      logger.log("Execute application._serverStart() to start the server");

      return this;
    },

    _configureApp : function(){
      var application = this;

      // *************************************************************************
      //                  Setup Thulium engine for Express
      // *************************************************************************
      logger.log("Setting Thulium Engine for Express");
      this.app.engine('html', require('thulium-express'));
      this.app.set('view engine', 'html');
      this.app.set('views', 'views');

      this.app.enable("trust proxy");

      // *************************************************************************
      //                            Static routes
      // *************************************************************************
      this.app.use('/', this.express.static('public'));

      // *************************************************************************
      //                            Request Logging
      // *************************************************************************
      this.app.use(morgan('combined', {stream: logger.stream}));

      return this;
    },

    _serverStart : function(){
      this.server.listen(CONFIG.port);
    },

    loadControllers : function(){
      var application = this;

      this._configureApp();

      logger.log('Loading Models');

      glob.sync("models/*.js").forEach(function(file) {
        logger.log('Loading ' + file + '...')
        var model = require(path.join(cwd, '/' + file));
      });

      logger.log('Loading BaseController.js');
      require('./controllers/BaseController.js');

      logger.log('Loading RestfulController.js');
      require('./controllers/RestfulController.js');

      glob.sync("controllers/**/*.js").forEach(function(file) {
        logger.log('Loading ' + file + '...');

        var fileNameArray = file.split('/');

        var controller = require(path.join(cwd, '/' + file));

        var controllerName = controller.name.toLowerCase();

        if (fileNameArray.length > 2) {
          fileNameArray.shift(1); // remove the first item of the array (controllers)
          fileNameArray.pop(1); // remove the last item of the array (filename)

          controllerName = fileNameArray.join('.') + '.' + controller.name.toLowerCase();
        }

        application.controllers[controllerName] = controller;
      });

      // *************************************************************************
      //                      External Middlewares
      // *************************************************************************
      CONFIG.middlewares.forEach(function(middleware) {
        logger.log('Loading ' + middleware.name + ' middleware: ' + middleware.path + '...');

        var middlewareFile = require(path.join(cwd, '/' + middleware.path));

        application.app.use(middlewareFile);
      });

      glob.sync("middlewares/*.js").forEach(function(file) {
        logger.log('Loading external middleware: ' + file + '...')
        var middleware = require(path.join(cwd, '/' + file));

        application.app.use(middleware);
      });

      return this;
    }
  }
});

//Startup
module.exports = new Application();
