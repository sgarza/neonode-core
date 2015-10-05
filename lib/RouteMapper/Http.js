/*!
 * Ported from route-mapper - Copyright(c) 2015 Fangdun Cai
 * MIT Licensed
 */

var METHODS = require('methods');
var _ = require('lodash');


RouteMapper.HTTP = Class(RouteMapper, 'HTTP')({
  METHODS : function() {
    return METHODS;
  },

  prototype : {
    init : function() {
      var that = this;
    },

    _mapMethod : function(method, args) {

      var parsedArgs = RouteMapper.Utils.parseArgs.apply(this, args);

      var paths = parsedArgs[0];
      var opts  = parsedArgs[1];
      var cb    = parsedArgs[2];

      opts.verb = method;

      return this.match(paths, opts, cb);
    }
  }
});


METHODS.forEach(function(m) {
  var v = m.replace('-', '');

  RouteMapper.HTTP.prototype[v] = eval(`(function $` + v + `() {
    return this._mapMethod('` + m + `', arguments)
  })`);
});

module.exports = RouteMapper.HTTP;
