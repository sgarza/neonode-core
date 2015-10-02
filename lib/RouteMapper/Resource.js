/*!
 * Ported from route-mapper - Copyright(c) 2015 Fangdun Cai
 * MIT Licensed
 */

var _ = require('lodash');
var pluralize = require('pluralize');
var ACTIONS = require('actions');

RouteMapper.Resource = Class(RouteMapper, 'Resource')({
  OPTIONS : {
    camelCase : true,
    param : 'id'
  },

  prototype : {
    /**
    * @constructor
    * @param {String} entities       - The resource name
    * @param {Object} options        - Defaults to empty object
    */
    init : function(entities, options) {
      if (!options) {
        options = {}
      }

      options = _.partialRight(_.assign, function(v, o, k) {
        return _.has(options, k) ? v : o
      })(options, this.constructor.OPTIONS);

      this._name = String(entities)
      this.options = options
      this.path = options.path || this._name
      this.controller = options.controller || this._name
      this.as = options.as
      this.param = options.param
      this.camelCase = options.camelCase
      return this;
    },

    defaultActions : function() {
      return ACTIONS.ACTIONS;
    },

    actions : function() {
      var only = this.options.only
      var except = this.options.except

      if (_.isString(only)) {
        only = [only];
      }

      if (_.isString(except)) {
        except = [except];
      }

      if (only && only.length) {
        return _.intersection(this.defaultActions(), only);
      } else if (except && except.length) {
        var without = _.spread(function(except) {
          return _.without(this.defaultActions(), except);
        });

        return without(except);
      }

      return this.defaultActions().slice(0);
    },

    name : function() {
      var as = this.as || this._name;

      return this.camelCase ? _.camelCase(as) : as;
    },

    plural : function() {
      return pluralize.plural(this.name());
    },

    singular : function() {
      return pluralize.singular(this.name());
    },

    /**
     * @example
     *  resource.memberName
     *  // => photo
     */
    memberName : function() {
      return this.singular();
    },

    /**
     * @example
     *  resource.collectionName
     *  // => index
     *  // => photoIndex
     *  // => photo_index
     *  // => photo
     */
    collectionName : function() {
      var name = '';

      if (!this.plural()) {
        name = 'index';
      } else if (this.singular() === this.plural()) {
        name = this.plural() + '_index';
      } else {
        name = this.plural();
      }

      return this.camelCase ? _.camelCase(name) : name;
    },

    resourceScope : function() {
      return  {
        controller : this.controller
      }
    },

    collectionScope : function() {
      return this.path;
    },

    /**
    * @example
    *  resource.memberScope
    *  // => photos/:id
    *  // => photos/:photoId/users/id
    *  // => photos/:photo_id/users/id
    */
    memberScope : function() {
      return this.path + '/:' + this.param;
    },

    /**
    * @example
    *  resource.nestedParam
    *  // => id
    *  // => photoId
    *  // => photo_id
    */
    nestedParam : function() {
      var param = this.param !== 'id' ? this.param : this.singular() + '_' + this.param;

      return this.camelCase ? _.camelCase(param) : param;
    },

    /**
    * @example
    *  resource.nestedScope
    *  // => photos/:id
    *  // => photos/:photoId/users/:id
    *  // => photos/:photo_id/users/:id
    */

    nestedScope : function() {
      return this.path + '/:' + this.nestedParam();
    },

    /**
    * @example
    *  resource.newScope('edit')
    *  // => photos/edit
    */
    newScope(newPath) {
      return this.path + '/' + newPath;
    }
  }
})
