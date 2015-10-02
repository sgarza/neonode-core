/*!
 * Ported from route-mapper - Copyright(c) 2015 Fangdun Cai
 * MIT Licensed
 */

var _ = require('lodash');

RouteMapper.Scope = Class(RouteMapper, 'Scope')({
  OPTIONS : [
    'path',
    'as',
    'module',
    'controller',
    'action',
    'pathNames',
    'options'
  ],

  RESOURCE_SCOPES : [
    'resource',
    'resources'
  ],

  RESOURCE_METHOD_SCOPES : [
    'collection',
    'member',
    'new'
  ],

  prototype : {
    init : function(current, parent, scopeLevel) {
      if (!parent) {
        parent = {};
      }

      if (!scopeLevel) {
        scopeLevel = '';
      }

      this.current = current;
      this.parent = parent;
      this.scopeLevel = scopeLevel;
      return this;
    },

    options : function() {
      return this.constructor.OPTIONS;
    },

    isNested : function() {
      return this.scopeLevel === 'nested';
    },

    isResources : function() {
      return this.scopeLevel === 'resources';
    },

    isResourceScope : function() {
      return this.constructor.RESOURCE_SCOPES.indexOf(this.scopeLevel) !== -1;
    },

    isResourceMethodScope : function() {
      return this.constructor.RESOURCE_METHOD_SCOPES.indexOf(this.scopeLevel) !== -1;
    },

    actionName : function(namePrefix, prefix, collectionName, memberName) {
      switch (this.scopeLevel) {
        case 'nested':
          return [namePrefix, prefix];
        case 'collection':
          return [prefix, namePrefix, collectionName];
        case 'new':
          return [prefix, 'new', namePrefix, memberName];
        case 'member':
          return [prefix, namePrefix, memberName];
        case 'root':
          return [namePrefix, collectionName, prefix];
        default:
          return [namePrefix, memberName, prefix];
      }
    },

    get : function(key, value) {
      if (_.has(this.current, key)) {
        return this.current[key];
      }

      if (_.has(this.parent, key)) {
        return this.parent[key];
      }

      if (this.parent instanceof RouteMapper.Scope) {
        return this.parent.get(key, value);
      }

      return value;
    },

    set : function(key, value) {
      this.current[key] = value;
    },

    create : function(current) {
      return new RouteMapper.Scope(current, this, this.scopeLevel);
    },

    createLevel : function(level) {
      return new RouteMapper.Scope(this, this, level);
    }
  }
});

module.exports = RouteMapper.Scope;
