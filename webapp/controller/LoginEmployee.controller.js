sap.ui.define([
  "./BaseController",
  "sap/m/MessageBox",
  "exam/model/AuthService"
], function(BaseController, MessageBox, AuthService) {
  "use strict";
  return BaseController.extend("exam.controller.LoginEmployee", {
    onLogin: function() {
  var email = this.byId("email").getValue();
  var password = this.byId("password").getValue();
  var that = this;
  AuthService.login(email, password)
    .then(() => AuthService.getCurrentUser())
    .then(user => {
  var userModel = new sap.ui.model.json.JSONModel(user);
  that.getView().setModel(userModel, "user");
  if (user.role && user.role.toLowerCase() === "employee") {
    that.getRouter().navTo("employee-dashboard");
  } else {
    MessageBox.error("Not an employee account!");
  }
})
    .catch(err => MessageBox.error("Login failed: " + err.message));
}
    /*onLogin: function() {
      console.log("Login pressed");  
      var email = this.byId("email").getValue();
      var password = this.byId("password").getValue();
      console.log(email, password); // Add this
      AuthService.login(email, password).then(data => {
        if (data.role === "employee") {
          this.getRouter().navTo("employee-dashboard");
        } else {
          MessageBox.error("Not an employee account!");
        }
      }).catch(err => MessageBox.error("Login failed: " + err.message));
    }*/
  });
});