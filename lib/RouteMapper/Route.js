/*!
 * Ported from route-mapper - Copyright(c) 2015 Fangdun Cai
 * MIT Licensed
 */

var _ = require('lodash');

RouteMapper.Route = Class(RouteMapper, 'Route')({
  prototype : {
    init : function($scope, path, options) {
      _.defaults(options, $scope.get('options'));

      this.defaultController = options.controller || $scope.get('controller');
      this.defaultAction = options.action || $scope.get('action');
      this.$scope = $scope;
      this.path = path;
      this.options = options;
      this.camelCase = options.camelCase;

      // cleanup options
      delete options.only;
      delete options.except;
      delete options.action;

      var toEndpoint = RouteMapper.Utils.splitTo(options.to);

      this._controller = toEndpoint[0] || this.defaultController;
      this._action = toEndpoint[1] || this.defaultAction;
      this._controller = this.addControllerModule(this._controller, $scope.get('module'));
    },

    as : function() {
      var _as = this.options.as || '';
      return this.camelCase ? _.camelCase(_as) : _as;
    },

    type : function() {
      return this.$scope.scopeLevel;
    },

    controller : function() {
      return this._controller || this.defaultController || ':controller';
    },

    action : function() {
      return this._action || this.defaultAction || ':action';
    },

    verb : function() {
      return _.isArray(this.options.verb) ? this.options.verb : [this.options.verb];
    },

    addControllerModule : function(controller, modyoule) {
      if (modyoule && _.isRegExp(controller)) {
        if (/^\//.test(controller)) {
          return controller.substr(1);
        } else if (/^\//.test(modyoule)) {
          modyoule = modyoule.substr(1);
        }

        return _.compact([modyoule, controller]).join('/');
      }

      return controller;
    },

    pathHelp : function() {
      var p = this.path;
      var matches = p.match(/:[a-z]+[0-9a-zA-Z_]+/g);

      var args = Array.prototype.slice.call(arguments, 0);

      if (matches) {
        matches.forEach(function(m, i) {
          p = p.replace(m, args[i]);
        });
      }

      return p;
    }
  }
});

module.exports = RouteMapper.Route;
