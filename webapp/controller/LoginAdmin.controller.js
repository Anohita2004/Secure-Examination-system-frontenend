sap.ui.define([
  "./BaseController",
  "sap/m/MessageBox",
  "exam/model/AuthService",
  "exam/model/PermissionChecker"
], function(BaseController, MessageBox, AuthService, PermissionChecker) {
  "use strict";
  return BaseController.extend("exam.controller.LoginAdmin", {
   onLogin: function() {
  var email = this.byId("email").getValue();
  var password = this.byId("password").getValue();
  var that = this;
  AuthService.login(email, password)
    .then(() => AuthService.getCurrentUser())
    .then(function(user) {
      var userModel = new sap.ui.model.json.JSONModel(user);
      that.getView().setModel(userModel, "user");

      if (user.role && user.role.toLowerCase() === "super_admin") {
        that.getRouter().navTo("super-admin-dashboard");
      } else {
        // Check for admin permissions
        // (You may want to check for ANY of the admin permissions)
        PermissionChecker.hasAnyPermission(user.id, [
          "create_exam", "assign_exam", "create_questions", "view_results", "view_dashboard"
        ]).then(function(hasAdminPermission) {
          if (hasAdminPermission) {
            that.getRouter().navTo("admin-dashboard");
          } else {
            MessageBox.error("You do not have admin access.");
          }
        });
      }
    })
    .catch(function(err) {
      MessageBox.error("Login failed: " + err.message);
    });
}
  
});
}
)