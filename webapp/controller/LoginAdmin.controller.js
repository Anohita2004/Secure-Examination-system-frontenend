/*sap.ui.define([
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
*/
sap.ui.define([
    "exam/controller/BaseController",
    "exam/model/AuthService",
    "exam/model/PermissionChecker",
    "sap/m/MessageToast"
], function (BaseController, AuthService, PermissionChecker, MessageToast) {
    "use strict";

    return BaseController.extend("exam.controller.LoginAdmin", {
        onLoginPress: async function () {
            const email = this.byId("usernameInput").getValue();
            const password = this.byId("passwordInput").getValue();

            if (!email || !password) {
                MessageToast.show("Please enter email and password");
                return;
            }

            try {
                // 🔹 Step 1: Call backend login
                const response = await AuthService.login(email, password);
                console.log("Login response:", response);

                // 🔹 Step 2: Check role & navigate
                if (response && response.user) {
                    if (response.user.role === "super_admin") {
                        this.getOwnerComponent().getRouter().navTo("super-admin-dashboard");
                    } else if (
                        response.user.role === "employee" && 
                        response.user.permissions?.length > 0
                    ) {
                        this.getOwnerComponent().getRouter().navTo("admin-dashboard");
                    } else {
                        MessageToast.show("You do not have admin permissions");
                    }
                } else {
                    MessageToast.show("Invalid response from server");
                }

            } catch (err) {
                console.error("Login failed:", err);
                MessageToast.show("Login failed. Please try again.");
            }
        },

        onLogin: async function () {
            const email = this.byId("email").getValue();
            const password = this.byId("password").getValue();

            if (!email || !password) {
                MessageToast.show("Please enter email and password");
                return;
            }

            try {
                const response = await AuthService.login(email, password);
                const user = response && response.user ? response.user : await AuthService.getCurrentUser();

                if (user && user.role) {
                    const role = String(user.role).toLowerCase();
                    if (role === "super_admin") {
                        this.getOwnerComponent().getRouter().navTo("super-admin-dashboard");
                        return;
                    }

                    if (role === "employee") {
                        if (Array.isArray(user.permissions) && user.permissions.length > 0) {
                            this.getOwnerComponent().getRouter().navTo("admin-dashboard");
                            return;
                        }
                        const userId = user.id || user.userId;
                        const hasAdminPermission = userId ? await PermissionChecker.hasAnyPermission(userId, [
                            "create_exam",
                            "assign_exam",
                            "create_questions",
                            "view_results",
                            "view_dashboard"
                        ]) : false;

                        if (hasAdminPermission) {
                            this.getOwnerComponent().getRouter().navTo("admin-dashboard");
                        } else {
                            MessageToast.show("You do not have admin permissions");
                        }
                        return;
                    }

                    MessageToast.show("You do not have admin permissions");
                } else {
                    MessageToast.show("Invalid response from server");
                }
            } catch (err) {
                console.error("Login failed:", err);
                MessageToast.show("Login failed. Please try again.");
            }
        },

        onForgotPassword: async function () {
            const email = this.byId("email").getValue();
            if (!email) {
                MessageToast.show("Please enter your registered email.");
                return;
            }

            try {
                const res = await fetch("http://localhost:4000/api/user/request-password-reset", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ email })
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Failed to send reset link.");
                }
                MessageToast.show("Password reset link sent to your email.");
            } catch (err) {
                MessageToast.show(err.message);
            }
        }
    });
});
