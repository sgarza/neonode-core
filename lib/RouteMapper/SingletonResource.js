/*!
 * Ported from route-mapper - Copyright(c) 2015 Fangdun Cai
 * MIT Licensed
 */

var _ = require('lodash');
require('lodash-inflection');

var SINGLETON_ACTIONS = require('actions').SINGLETON_ACTIONS;

RouteMapper.SingletonResource = Class(RouteMapper, 'SingletonResource').inherits(RouteMapper.Resource)({
  prototype : {
    init : function(entity, options) {
      RouteMapper.Resource.prototype.init.call(this, entity, options);

      this.as = null;
      this.controller = options.controller || this.plural();
      this.as = options.as;
    },

    defaultActions : function() {
      return SINGLETON_ACTIONS;
    },

    plural : function() {
      return _.pluralize(this.name);
    },

    singular : function() {
      return this.name;
    },

    memberName : function() {
      return this.singular();
    },

    collectionName : function() {
      return this.singular();
    },

    memberScope : function() {
      return this.path;
    },

    nestedScope : function() {
      return this.path;
    }
  }
});
