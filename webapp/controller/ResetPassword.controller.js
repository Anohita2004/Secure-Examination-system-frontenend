sap.ui.define([
  "./BaseController",
  "sap/m/MessageBox"
], function(BaseController, MessageBox) {
  "use strict";

  function getTokenFromUrl() {
    // Try standard query string first
    var searchParams = new URLSearchParams(window.location.search || "");
    var tokenFromSearch = searchParams.get("token");
    if (tokenFromSearch) {
      return tokenFromSearch;
    }
    // Fallback: parse query params after the hash (e.g., index.html#/reset-password?token=...)
    var hash = window.location.hash || ""; // e.g., #/reset-password?token=abc
    var queryIndex = hash.indexOf("?");
    if (queryIndex !== -1) {
      var queryString = hash.substring(queryIndex + 1);
      var hashParams = new URLSearchParams(queryString);
      return hashParams.get("token");
    }
    return null;
  }

  return BaseController.extend("exam.controller.ResetPassword", {
    onInit: function() {
      // Cache the token so we don't lose it if the router rewrites the hash
      this._resetToken = getTokenFromUrl();
      if (!this._resetToken) {
        MessageBox.error("Invalid or missing reset token.");
        // Optionally, redirect to login or home
      }
    },

    onResetPassword: function() {
      // Prefer cached token; fall back to current URL parsing
      var token = this._resetToken || getTokenFromUrl();
      var newPassword = this.byId("newPasswordInput").getValue();
      var confirmPassword = this.byId("confirmPasswordInput").getValue();

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
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.error) {
          MessageBox.error(data.error);
        } else {
          MessageBox.success("Password reset successfully! You can now log in.");
          // Optionally redirect to login page after a short delay
        }
      })
      .catch(function(err) {
        MessageBox.error("Error: " + err.message);
      });
    }
  });
});