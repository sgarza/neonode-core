Module('ValidationSupport')({
  validations : null,
  prototype : {
    errors : [],
    isValid : function(callback) {
      var valid = false;

      var checkit = new Checkit(this.validations);

      var validationResult = checkit.validateSync(this);

      if (validationsResult[0]) {
        this.errors = validationsResult[0];
      } else {
        valid = true;
      }

      return callback(valid);
    }
  }
});