sap.ui.define([
  "./BaseController",
  "sap/m/MessageBox"
], function(BaseController, MessageBox) {
  "use strict";

  return BaseController.extend("exam.controller.ResetPassword", {
    onInit: function() {
      // Optionally, you can check for the token in the URL and show an error if missing
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      if (!token) {
        MessageBox.error("Invalid or missing reset token.");
        // Optionally, redirect to login or home
      }
    },

    onResetPassword: function() {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const newPassword = this.byId("newPasswordInput").getValue();
      const confirmPassword = this.byId("confirmPasswordInput").getValue();

      if (!newPassword || !confirmPassword) {
        MessageBox.error("All fields are required.");
        return;
      }
      if (newPassword !== confirmPassword) {
        MessageBox.error("Passwords do not match.");
        return;
      }
      if (!token) {
        MessageBox.error("Invalid or missing reset token.");
        return;
      }
      fetch("http://localhost:4000/api/user/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, new_password: newPassword })
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          MessageBox.error(data.error);
        } else {
          MessageBox.success("Password reset successfully! You can now log in.");
          // Optionally redirect to login page after a short delay
        }
      })
      .catch(err => {
        MessageBox.error("Error: " + err.message);
      });
    }
  });
});