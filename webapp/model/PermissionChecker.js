sap.ui.define([
  "exam/model/PermissionService"
], function (PermissionService) {
  "use strict";

  function extractNames(permissions) {
    return permissions.map(function (p) { return (typeof p === "string" ? p : p.name) || ""; })
      .map(function (n) { return String(n).toLowerCase(); });
  }

  return {
    hasPermission: function(userId, permissionName) {
      return PermissionService.getUserPermissions(userId)
        .then(function(permissions) {
          const names = extractNames(permissions);
          return names.includes(String(permissionName).toLowerCase());
        })
        .catch(function(err) {
          console.error("Permission check failed:", err);
          return false;
        });
    },

    hasAllPermissions: function(userId, permissionNames) {
      return PermissionService.getUserPermissions(userId)
        .then(function(permissions) {
          const names = extractNames(permissions);
          return permissionNames.map(function(n){return String(n).toLowerCase();}).every(function(name){ return names.includes(name); });
        })
        .catch(function(err) {
          console.error("Permission check failed:", err);
          return false;
        });
    },

    hasAnyPermission: function(userId, permissionNames) {
      return PermissionService.getUserPermissions(userId)
        .then(function(permissions) {
          const names = extractNames(permissions);
          return permissionNames.map(function(n){return String(n).toLowerCase();}).some(function(name){ return names.includes(name); });
        })
        .catch(function(err) {
          console.error("Permission check failed:", err);
          return false;
        });
    }
  };
});
