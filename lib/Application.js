var Application = Class({}, 'Application')({
  prototype : {
    express           : express,
    http              : http,
    server            : null,
    io                : null,
    router            : null,
    env               : CONFIG.environment,
    db                : db,

    init : function (){
      logger.log("Initializing Application");

      this._configureApp()
        ._serverStart();

      logger.log("Application Initialized");

      return this;
    },

    _configureApp : function(){
      var application = this;

      this.app = this.express();

      this.server = this.http.createServer(this.app);

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

      // *************************************************************************
      //                            Init Router
      // *************************************************************************
      this.router = this.express.Router();

      this.app.use(this.router);

      // *************************************************************************
      //                            MiddleWares
      // *************************************************************************
      logger.log("Setting up middlewares...");

      // *************************************************************************
      //                      External Middlewares
      // *************************************************************************
      glob.sync("middlewares/*.js").forEach(function(file) {
        logger.log('Loading external middleware: ' + file + '...')
        var middleware = require(path.join(cwd, '/' + file));

        application.app.use(middleware);
      });

      return this;
    },

    _serverStart : function(){
      this.server.listen(CONFIG.port);
    },

    loadControllers : function(){
      var application = this;

      logger.log('Loading Models');

      require('./models/Model');

      glob.sync("models/*.js").forEach(function(file) {
        logger.log('Loading ' + file + '...')
        var model = require(path.join(cwd, '/' + file));
      });

      logger.log('Loading RestfulController.js');
      require('./controllers/RestfulController.js');

      logger.log('Loading ApplicationController.js');
      require('./controllers/ApplicationController.js');

      var route;

      glob.sync("controllers/*.js").forEach(function(file) {
        logger.log('Loading ' + file + '...')
        var controller = require(path.join(cwd, '/' + file));
      });

      return this;
    }
  }
});

//Startup
module.exports = new Application();
