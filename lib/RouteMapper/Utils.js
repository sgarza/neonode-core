/*!
 * Ported from route-mapper - Copyright(c) 2015 Fangdun Cai
 * MIT Licensed
 */

var _ = require('lodash');
var Path = require('path');

RouteMapper.Utils = Module(RouteMapper, 'Utils')({
  /**
  * Split a string to an array.
  *
  * @example
  *  RouteMapper.Utils.splitTo('controller#action')
  *  // => [ 'controller', 'action' ]
  *
  * @param {String} to
  * @return {Array} [ controller, action ]
  */
  splitTo : function(to) {
    if (!to) {
      to = '';
    }

    if (/#/.test(to)) {
      return to.split('#');
    }

    return [];
  },

  /**
  * Normalize Path
  *
  * @param {String} path
  * @return {String}
  */

  normalizePath : function(path) {
    path = '/' + path;

    path = Path.resolve(Path.normalize(path));

    path = path.replace(/(%[a-f0-9]{2})/g, function($1) {
      $1.toUpperCase();
    });

    if (path === '') {
      path = '/'
    }

    return path;
  },

  /**
  * Parse the arguments and return an special array.
  *
  * @example
  *  RouteMapper.Utils.parseArgs(path)
  *  // => [[path], {}, undefined]
  *  RouteMapper.Utils.parseArgs(path, cb)
  *  // => [[path], {}, cb]
  *  RouteMapper.Utils.parseArgs(path, options)
  *  // => [[path], options, undefined]
  *  RouteMapper.Utils.parseArgs(options)
  *  // => [[], options, undefined]
  *
  * @param {Array|ArrayLike} arguments
  * @return {Array} [ [path, path], {}, function ]
  */
  parseArgs : function() {
    var utils = this;

    var args = Array.prototype.slice.call(arguments, 0);

    var l = args.length;

    var last = args[l - 1];

    var cb, opts, paths;


    if (_.isFunction(last)) {
      cb = last;

      args.pop();

      var parsedArgs = RouteMapper.Utils.parseArgs.apply(RouteMapper.Utils.parseArgs, args);

      paths = parsedArgs[0];
      opts  = parsedArgs[1];
    } else if (_.isObject(last) && !_.isArray(last)) {
      opts = last;
      args.pop();
      paths = args;
    } else if (!last && l > 0) {
      args.pop();

      var parsedArgs = RouteMapper.Utils.parseArgs.apply(RouteMapper.Utils.parseArgs, args);

      return parsedArgs

    } else {
      paths = args;
    }

    return [_.compact(_.flatten(paths, true)), opts || {}, cb];
  },

  mergeScope : {
    // parent/child
    path : function(parent, child) {
      return parent ? RouteMapper.Utils.normalizePath(parent + '/' + child) : child
    },

    // parent_child
    as : function(parent, child) {
      return parent ? parent + '_' + child : child
    },

    // parent/child
    module : function(parent, child) {
      return parent ? RouteMapper.Utils.normalizePath(parent + '/' + child) : child
    },

    controller : function(parent, child) {
      return child;
    },

    action : function(parent, child) {
      return child;
    },

    pathNames : function(parent, child) {
      return this.options(parent, child);
    },

    options : function(parent, child) {
      parent = _.assign(parent || {});

      var excepts = this.overrideKeys(child);

      excepts.forEach(function(key) {
        delete parent[key];
      });

      return _.assign(parent, child);
    },

    overrideKeys : function(child) {
      return (child.only || child.except) ? ['only', 'except'] : [];
    }
  }
});

module.exports = RouteMapper.Utils;
