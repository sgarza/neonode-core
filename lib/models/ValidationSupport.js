Module('ValidationSupport')({
  prototype : {
    isValid : function(callback) {
      var valid = false;

      if (!this.constructor.validations) {
        this.constructor.validations = {}
      }

      var checkit = new Checkit(this.constructor.validations);

      var validationResult = checkit.validateSync(this);

      if (validationResult && validationResult[0]) {
        this.errors = validationResult[0];
      } else {
        valid = true;
      }

      return callback(valid);
    }
  }
});