sap.ui.define([
  "exam/model/PermissionService"
], function (PermissionService) {
  "use strict";
  
  return {
    // Check if user has a specific permission
    hasPermission: function(userId, permissionName) {
      return PermissionService.getUserPermissions(userId)
        .then(function(permissions) {
          return permissions.some(p => p.name === permissionName);
        })
        .catch(function(err) {
          console.error("Permission check failed:", err);
          return false;
        });
    },

    // Check multiple permissions (user needs ALL of them)
    hasAllPermissions: function(userId, permissionNames) {
      return PermissionService.getUserPermissions(userId)
        .then(function(permissions) {
          const userPermissionNames = permissions.map(p => p.name);
          return permissionNames.every(name => userPermissionNames.includes(name));
        })
        .catch(function(err) {
          console.error("Permission check failed:", err);
          return false;
        });
    },

    // Check multiple permissions (user needs ANY of them)
    hasAnyPermission: function(userId, permissionNames) {
      return PermissionService.getUserPermissions(userId)
        .then(function(permissions) {
          const userPermissionNames = permissions.map(p => p.name);
          return permissionNames.some(name => userPermissionNames.includes(name));
        })
        .catch(function(err) {
          console.error("Permission check failed:", err);
          return false;
        });
    }
  };
});