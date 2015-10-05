/*!
 * Ported from route-mapper - Copyright(c) 2015 Fangdun Cai
 * MIT Licensed
 */

var _ = require('lodash');
var Actions = require('actions');
var getProrotypesOf = require('object-getprototypesof');

RouteMapper.Mapper = Class(RouteMapper, 'Mapper').inherits(RouteMapper.HTTP)({
  VALID_ON_OPTIONS : [
    'new',
    'collection',
    'member'
  ],

  RESOURCE_OPTIONS : [
    'as',
    'controller',
    'path',
    'only',
    'except',
    'param',
    'concerns'
  ],

  DEFAULT_OPTIONS : {
    pathNames: {
      'new': 'new',
      'edit': 'edit'
    }
  },

  prototype : {
    init : function(options) {
      if (!options) {
        options = {};
      }

      _.defaults(options, this.constructor.DEFAULT_OPTIONS);

      RouteMapper.HTTP.prototype.init.call(this);

      this.$scope = new RouteMapper.Scope({
        pathNames : options.pathNames
      });

      this.nesting = [];
      this.routes = [];
      this.camelCase = true;
      this.helpers = Object.create(null);
      this._concerns = Object.create(null);
    },

    /**
    * Scopes a set of routes to the given default options.
    *
    * @example
    *  scope({ path: ':account_id', as: 'acount' }, () => {
    *    resources('posts')
    *  })
    *  // => /accounts/:account_id/photos
    *
    *  scope({ module: 'admin' }, () => {
    *    resources('posts')
    *  })
    *  // => /posts  admin/posts
    *
    *  scope({ path: '/admin' }, () => {
    *    resources('posts')
    *  })
    *  // => /admin/posts
    *
    *  scope({ as: 'sekret' }, () => {
    *    resources('posts')
    *  })
    *
    * @method scope
    *
    * @return {RouteMapper.Mapper} this
    */
    scope : function() {
      var args = Array.prototype.slice.call(arguments, 0);

      var parsedArgs = RouteMapper.Utils.parseArgs.apply(this, args);

      var paths = parsedArgs[0];
      var options = parsedArgs[1];
      var cb = parsedArgs[2];

      var scopeOptions = Object.create(null);

      if (paths.length) {
        options.path = paths.join('/');
      }

      var that = this;

      this.$scope.options().forEach(function(option) {
        var value;

        if (option === 'options') {
          value = options;
        } else {
          value = options[option];
          delete options[option];
        }

        if (value) {
          scopeOptions[option] = RouteMapper.Utils.mergeScope[option](that.$scope.get(option), value);
        }
      });

      if (_.isFunction(cb)) {
        this.$scope =this.$scope.create(scopeOptions);
        cb.call(this);
        this.$scope = this.$scope.parent;
      }

      return this;
    },

    /**
    * Scopes routes to a specific controller.
    *
    * @example
    *  controller('food', () => {
    *    match('bacon', { action: 'bacon' })
    *  })
    *
    * @method controller
    *
    * @return {RouteMapper} this
    */
    controller : function(controller, options, cb) {
      if (!options) {
        options = {}
      }

      if (_.isFunction(options)) {
        cb = options;
        options = {}
      }

      options.controller = controller;

      return this.scope(options, cb);
    },

    match : function() {
      var args = Array.prototype.slice.call(arguments, 0);

      var parsedArgs = RouteMapper.Utils.parseArgs.apply(RouteMapper.Utils.parseArgs, args);

      var paths = parsedArgs[0];
      var options = parsedArgs[1];
      var cb = parsedArgs[2];

      var to = options.to;

      if (to) {
        if (!/#/.test(to)) {
          options.controller = to;
        }
      }

      if (paths.length === 0 && options.path) {
        paths = [options.path];
      }

      if (options.on && this.constructor.VALID_ON_OPTIONS.indexOf(options.on) === -1) {
        throw new Error('Unknown scope ' + options.on + 'given to "on"');
      }

      var controller = this.$scope.get('controller');
      var action = this.$scope.get('action');

      if (controller && action && !_.has(options, 'to')) {
        options.to = controller + '#' + action;
      }

      var that = this;

      paths.forEach(function(p) {
        var routeOptions = _.assign(options);

        routeOptions.path = p;

        var pathWithoutFormat = p.replace(/\.:format\??$/, '');

        if (that.isUsingMatchShorthand(pathWithoutFormat, routeOptions)) {
          if (!_.has(options, 'to')) {
            routeOptions.to = pathWithoutFormat.replace(/^\//g, '').replace(/\/([^\/]*)$/, '#$1');
          }

          routeOptions.to = routeOptions.to.replace(/-/g, '_');
        }

        that.decomposedMatch(p, routeOptions);
      });

      return this;
    },

    root : function(path, options) {
      var that = this;

      var _root = function(opts) {
        opts = _.assign({}, {
          as : 'root',
          verb : 'get',

        }, opts);

        return that.match('/', opts);
      }

      if (!options) {
        options = {};
      }

      if (_.isString(path)) {
        options.to = path;
      } else if (_.isObject(path) && _.isEmpty(options)) {
        options = path;
      } else {
        throw new Error('Must be called with a path and/or options');
      }

      var that = this;

      if (this.$scope.isResources()) {
        this.withScopeLevel('root', function() {
          that.scope(that.parentResource().path, function() {
            _root.call(that, options);
          });
        });
      } else {
        _root.call(this, options);
      }

      return this;
    },

    // TODO
    mount : function() {

    },

    resource : function() {
      var args = Array.prototype.slice.call(arguments, 0);

      var parsedArgs = RouteMapper.Utils.parseArgs.apply(RouteMapper.Utils.parseArgs, args);

      var resourcesArray = parsedArgs[0];
      var options = parsedArgs[1];
      var cb = parsedArgs[2];
      var kind = 'resource';

      if (this.applyCommonBehaviorFor(kind, resourcesArray, options, cb)) {
        return this;
      }

      // set style
      options.camelCase = this.camelCase;

      var that = this;

      this.resourceScope(
        kind,
        new RouteMapper.SingletonResource(resourcesArray.pop(), options), function() {

          if (_.isFunction(cb)) {
            cb.call(this);
          }

          if (options.concerns) {
            this.concerns(options.concerns);
          }

          var actions = that.parentResource().actions();

          if (actions.indexOf('create') !== -1) {
            that.collection(function() {
              that.post('create');
            });
          }

          if (actions.indexOf('new') !== -1) {
            that.new(function() {
              that.get('new');
            });
          }

          that.setMemberMappingsForResource();
        });

      return this;
    },

    resources : function() {
      var args = Array.prototype.slice.call(arguments, 0);

      var parsedArgs = RouteMapper.Utils.parseArgs.apply(this, args);

      var resourcesArray = parsedArgs[0];
      var options = parsedArgs[1];
      var cb = parsedArgs[2];
      var kind = 'resources';

      if (this.applyCommonBehaviorFor(kind, resourcesArray, options, cb)) {
        return this
      }

      // set style
      options.camelCase = this.camelCase;

      var that = this;

      var resource = new RouteMapper.Resource(resourcesArray.pop(), options);
      this.resourceScope(
        kind,
        resource,
        function() {
          if (_.isFunction(cb)) {
            cb.call(this);
          }

          if (options.concerns) {
            that.concerns(options.concerns);
          }

          var actions = that.parentResource().actions();

          that.collection(function() {
            if (actions.indexOf('index') !== -1) {
              that.get('index');
            }

            if (actions.indexOf('create') !== -1) {
              that.post('create');
            }
          });

          if (actions.indexOf('new') !== -1) {
            that.new(function() {
              that.get('new');
            });
          }

          that.setMemberMappingsForResource();
        }
      );

      return this;
    },

    collection : function(cb) {
      if (!this.$scope.isResourceScope()) {
        throw new Error('Can\'t use collection outside resource(s) scope');
      }

      var that = this;

      this.withScopeLevel('collection', function() {
        that.scope(that.parentResource().collectionScope(), cb);
      });

      return this;
    },

    member : function(cb) {
      if (!this.$scope.isResourceScope()) {
        throw new Error('Can\'t use member outside resource(s) scope');
      }

      var that = this;

      this.withScopeLevel('member', function() {
        that.scope(that.parentResource().memberScope(), cb);
      });

      return this;
    },

    new : function(cb) {
      if (!this.$scope.isResourceScope()) {
        throw new Error('Can\'t use new outside resource(s) scope');
      }

      var that = this;

      this.withScopeLevel('new', function() {
        that.scope(that.parentResource().newScope(that.actionPath('new')), cb);
      });

      return this;
    },

    nested : function(cb) {
      if (!this.$scope.isResourceScope()) {
        throw new Error('Can\'t use nested outside resource(s) scope');
      }

      var that = this;

      this.withScopeLevel('nested', function() {
        that.scope(that.parentResource().nestedScope(), that.nestedOptions, cb);
      });

      return this;
    },

    namespace : function() {

      var that = this;

      var _namespace = function(path, options, cb) {
        if (!options) {
          options = {}
        }

        path = String(path);

        var defaults = {
          module : path,
          path : options.path || path,
          as : options.as || path
        }

        _.assign(defaults, options);

        return that.scope(defaults, cb);
      }

      var args = Array.prototype.slice.call(arguments, 0);

      var parsedArgs = RouteMapper.Utils.parseArgs.apply(this, args);

      if (this.$scope.isResourceScope()) {
        this.nested(function() {
          _namespace.apply(that, parsedArgs);
        });
      } else {
        _namespace.apply(that, parsedArgs);
      }

      return this;
    },

    concern : function(name, callable, cb) {
      var that = this;

      if (!_.isFunction(callable)) {
        callable = function(options) {
          if (_.isFunction(cb)) {
            cb.call(that, options);
          }
        }
      }

      this._concerns[name] = callable;
    },

    concerns : function() {
      var args = Array.prototype.slice.call(arguments, 0);

      var parsedArgs = RouteMapper.Utils.parseArgs.apply(RouteMapper.Utils.parseArgs, args);

      var names = parsedArgs[0];
      var options = parsedArgs[1];
      var cb = parsedArgs[2];

      var that = this;

      names.forEach(function(name) {
        var concern = that._concerns[name];

        if (_.isFunction(concern)) {
          concern.call(that, options);
        } else {
          throw new Error('No concern named ' + concern + ' was found!');
        }
      });

      return this;
    },

    applyCommonBehaviorFor : function(method, resources, options, cb) {
      var that = this;

      if (resources.length > 1) {
        resources.forEach(function(r) {
          that[method](r, options, cb);
        });

        return true;
      }

      if (this.$scope.isResourceScope()) {
        this.nested(function() {
          that[method](resources.pop(), options, cb);
        });

        return true;
      }

      var scopeOptions = {};

      _.keys(options).forEach(function(k) {
        if (that.constructor.RESOURCE_OPTIONS.indexOf(options[k]) === -1) {
          scopeOptions[k] = options[k];
          delete options[k];
        }
      });

      if (_.keys(scopeOptions).length) {
        this.scope(scopeOptions, function() {
          that[method](resources.pop(), options, cb);
        });
      }

      if (!this.isActionOptions(options)) {
        if (this.isScopeActionOptions()) {
          _.assign(options, this.scopeActionOptions());
        }
      }

      return false;
    },

    resourceScope : function(kind, resource, cb) {
      this.$scope = this.$scope.create({
        scopeLevelResource : resource
      });

      this.nesting.push(resource);

      var that = this;

      this.withScopeLevel(kind, function() {
        that.scope(that.parentResource().resourceScope(), cb);
      });

      this.nesting.pop();
      this.$scope = this.$scope.parent;
    },

    withScopeLevel : function(kind, cb) {
      this.$scope = this.$scope.createLevel(kind);

      if (_.isFunction(cb)) {
        cb.call(this);
      }

      this.$scope = this.$scope.parent;
    },

    setMemberMappingsForResource : function() {
      var that = this;

      this.member(function() {
        var actions = that.parentResource().actions();

        if (actions.indexOf('edit') !== -1) {
          that.get('edit');
        }

        if (actions.indexOf('show') !== -1) {
          that.get('show');
        }

        if (actions.indexOf('update') !== -1) {
          that.patch('update');
          that.put('update');
        }

        if (actions.indexOf('destroy') !== -1) {
          that.delete('destroy');
        }
      });
    },

    decomposedMatch : function(path, options) {
      var on = options.on;

      var that = this;

      if (on) {
        this[on](function() {
          delete options.on;
          that.decomposedMatch(path, options);
        });
      } else {
        switch (this.$scope.scopeLevel) {
          case 'resources':
            that.nested(function() {
              that.decomposedMatch(path, options);
            });
            break;
          case 'resource':
            that.member(function() {
              thath.decomposedMatch(path, options);
            });
            break;
          default:
            that.addRoute(path, options);
        }
      }
    },

    addRoute : function(action, options) {
      var path = RouteMapper.Utils.normalizePath(this.pathForAction(action, options.path));

      delete options.path;

      action = String(action);

      if (/^[\w\-\/]+$/.test(action)) {
        if (!action.indexOf('/') !== -1 && !_.has(options, 'action')) {
          options.action = action.replace(/-/g, '_');
        }
      } else {
        action = null;
      }

      options.camelCase = this.camelCase;
      options.as = this.nameForAction(options.as, action);

      var route = new RouteMapper.Route(this.$scope, path, options);

      if (!_.has(this.helpers, route.as())) {
        this.helpers[route.as()] = route.pathHelp.bind(route);
      }

      this.routes.push(route);
    },

    pathForAction : function(action, path) {
      if (path && this.isCanonicalAction(action)) {
        return this.$scope.get('path');
      } else {
        var scopePath = this.$scope.get('path');
        var actionPath = this.actionPath(action, path);
        return _.compact([scopePath, actionPath]).join('/');
      }
    },

    nameForAction : function(as, action) {
      var prefix = this.prefixNameForAction(as, action);
      var namePrefix = this.$scope.get('as');
      var collectionName,
        memberName;
      var parentResource = this.parentResource();

      if (parentResource) {
        if (!(as || action)) {
          return null;
        }

        collectionName = parentResource.collectionName();
        memberName = parentResource.memberName();
      }

      var actionName = this.$scope.actionName(namePrefix, prefix, collectionName, memberName);
      var candidate = _.compact(actionName).join('_');

      if (candidate) {
        if (!as) {
          if (/^[_a-zA-Z]/.test(candidate) && !(_.has(this.helpers, candidate))) {
            return candidate
          }
        } else {
          return candidate;
        }
      }
    },

    prefixNameForAction : function(as, action) {
      var prefix;

      if (as) {
        prefix = as;
      } else if (!this.isCanonicalAction(action)) {
        prefix = action;
      }

      if (prefix && prefix !== '/') {
        return prefix.replace(/-/g, '_');
      }

      return prefix;
    },

    // getters
    parentResource : function() {
      return this.$scope.get('scopeLevelResource');
    },

    isScopeActionOptions : function() {
      var options = this.$scope.get('options');
      return options && (options.only || options.except);
    },

    nestedOptions : function() {
      var parentResource = this.parentResource();
      var options = {
        as : parentResource.memberName()
      }

      return options;
    },
    // end getters

    isActionOptions : function(options) {
      return options.only || options.except;
    },

    isCanonicalAction : function(action) {
      return this.$scope.isResourceMethodScope() && (Actions.CANONICAL_ACTIONS.indexOf(action) !== -1);
    },

    isUsingMatchShorthand : function(path, options) {
      return path && !(options.to || options.action) && /\/[\w\/]+$/.test(path);
    },

    scopeActionOptions : function() {
      var options = this.$scope.get('options');
      var o = {};

      _.keys(options).forEach(function(k) {
        if (k === 'only' || k === 'except') {
          o[k] = options[k];
        }
      });

      return o;
    },

    actionPath : function(name, path) {
      return path || this.$scope.get('pathNames')[name] || name;
    }

  }
});

module.exports = RouteMapper.Mapper;
