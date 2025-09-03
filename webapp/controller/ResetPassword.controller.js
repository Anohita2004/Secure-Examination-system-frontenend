sap.ui.define([
  "./BaseController",
  "sap/m/MessageBox"
], function(BaseController, MessageBox) {
  "use strict";

  function getTokenFromUrl() {
    // 1) Try standard query string: ...?token=abc
    var searchParams = new URLSearchParams(window.location.search || "");
    var tokenFromSearch = searchParams.get("token");
    if (tokenFromSearch) {
      return tokenFromSearch;
    }

    // 2) Try query string after hash: #/reset-password?token=abc
    var hash = window.location.hash || "";
    var queryIndex = hash.indexOf("?");
    if (queryIndex !== -1) {
      var queryString = hash.substring(queryIndex + 1);
      var hashParams = new URLSearchParams(queryString);
      var tokenFromHashQuery = hashParams.get("token");
      if (tokenFromHashQuery) {
        return tokenFromHashQuery;
      }
    }

    // 3) Try path parameter style: #/reset-password/<token> or #/reset-password/token/<token>
    // Normalize and split hash path
    var trimmedHash = hash.replace(/^#\/?/, ""); // remove leading #/
    var segments = trimmedHash.split(/[/?&#]+/).filter(Boolean);
    // Look for patterns
    // a) ["reset-password", "<token>"]
    if (segments.length >= 2 && segments[0] === "reset-password" && segments[1] && segments[1] !== "token") {
      return segments[1];
    }
    // b) ["reset-password", "token", "<token>"]
    if (segments.length >= 3 && segments[0] === "reset-password" && segments[1] === "token" && segments[2]) {
      return segments[2];
    }

    return null;
  }

  return BaseController.extend("exam.controller.ResetPassword", {
    onInit: function() {
      // Cache the token so we don't lose it if the router rewrites the hash
      var token = getTokenFromUrl();
      if (token) {
        this._resetToken = token;
        try { sessionStorage.setItem("resetToken", token); } catch (e) {}
      } else {
        try { this._resetToken = sessionStorage.getItem("resetToken"); } catch (e) { this._resetToken = null; }
      }
      if (!this._resetToken) {
        MessageBox.error("Invalid or missing reset token.");
        // Optionally, redirect to login or home
      }
    },

    onResetPassword: function() {
      // Prefer cached token; fall back to storage and current URL parsing
      var token = this._resetToken;
      if (!token) {
        try { token = sessionStorage.getItem("resetToken"); } catch (e) {}
      }
      if (!token) {
        token = getTokenFromUrl();
        if (token) {
          try { sessionStorage.setItem("resetToken", token); } catch (e) {}
        }
      }
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