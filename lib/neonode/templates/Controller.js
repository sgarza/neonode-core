var <%= name %>Controller = Class('<%= name %>Controller').inherits(BaseController)({
  prototype : {
    init : function (config){
      BaseController.prototype.init.call(this, config);

      return this;
    },

    index : function(req, res) {
      res.render('<%= name.toLowerCase() %>/index.html', {layout : false, localVariable: true });
    },
  }
});

module.exports = new <%=name%>Controller();
