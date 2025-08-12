sap.ui.define([
  "./BaseController",
  "sap/m/MessageBox",
  "exam/model/AuthService",
  "exam/model/PermissionChecker"
], function(BaseController, MessageBox, AuthService, PermissionChecker) {
  "use strict";

  return BaseController.extend("exam.controller.LoginAdmin", {

    onLogin: function() {
      const email = this.byId("email").getValue();
      const password = this.byId("password").getValue();
      const that = this;

      AuthService.login(email, password)
        .then(() => AuthService.getCurrentUser())
        .then(function(user) {
          const userModel = new sap.ui.model.json.JSONModel(user);
          that.getView().setModel(userModel, "user");

          if (user.role && user.role.toLowerCase() === "super_admin") {
            that.getRouter().navTo("super-admin-dashboard");
          } else {
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
    },

    onForgotPassword: function() {
      const email = this.byId("email").getValue(); // ✅ Use correct ID
      if (!email) {
        return sap.m.MessageBox.error("Please enter your registered email.");
      }

      fetch("http://localhost:4000/api/superadmin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          sap.m.MessageBox.success("Password reset link sent to your email.");
        } else {
          sap.m.MessageBox.error(data.error || "Failed to send reset link.");
        }
      })
      .catch(err => sap.m.MessageBox.error("Error: " + err.message));
    }

  });

});
