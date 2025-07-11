sap.ui.define([
  "./BaseController",
  "sap/m/MessageBox",
  "exam/model/AuthService",
  "exam/model/PermissionService"
], function (BaseController, MessageBox, AuthService, PermissionService) {
  "use strict";
  
  return BaseController.extend("exam.controller.SuperAdminDashboard", {
    onInit: function () {
       var that = this;
  AuthService.getCurrentUser()
    .then(function(user) {
      if (user.role !== 'super_admin') {
        MessageBox.error("Access denied. Super admin required.");
        that.getRouter().navTo("main");
        return;
      }
      var userModel = new sap.ui.model.json.JSONModel(user);
      that.getView().setModel(userModel, "user");

      // FIX: Set a default model for dashboard data
      var oModel = new sap.ui.model.json.JSONModel({});
      that.getView().setModel(oModel);

      // Load initial data
      return that.loadData();
    })
    .catch(function(err) {
      MessageBox.error("Authentication failed: " + err.message);
      that.getRouter().navTo("main");
    });
    },

    loadData: function() {
      var that = this;
      
      // Load users with permissions
      PermissionService.getAllUsersWithPermissions()
        .then(function(users) {
          var model = that.getView().getModel();
          model.setProperty("/users", users);
        })
        .catch(function(err) {
          MessageBox.error("Failed to load users: " + err.message);
        });
      
      // Load available permissions
      PermissionService.getAllPermissions()
        .then(function(permissions) {
          var model = that.getView().getModel();
          model.setProperty("/permissions", permissions);
        })
        .catch(function(err) {
          MessageBox.error("Failed to load permissions: " + err.message);
        });
    },

    onManagePermissions: function(oEvent) {
      var oContext = oEvent.getSource().getBindingContext();
      var user = oContext.getObject();
      
      // Load user's current permissions
      PermissionService.getUserPermissions(user.id)
        .then(function(permissions) {
          var model = this.getView().getModel();
          model.setProperty("/selectedUser", {
            ...user,
            permissions: permissions
          });
        }.bind(this))
        .catch(function(err) {
          MessageBox.error("Failed to load user permissions: " + err.message);
        });
    },

    onAssignPermission: function() {
      var that = this;
      var selectedUser = this.getView().getModel().getProperty("/selectedUser");
      var permissionSelect = this.byId("permissionSelect");
      var permissionId = permissionSelect.getSelectedKey();
      
      if (!selectedUser || !selectedUser.id) {
        MessageBox.warning("Please select a user first.");
        return;
      }
      
      if (!permissionId) {
        MessageBox.warning("Please select a permission to assign.");
        return;
      }
      
      PermissionService.assignPermission(selectedUser.id, permissionId)
        .then(function() {
          MessageBox.success("Permission assigned successfully!");
          that.loadData(); // Refresh the data
          that.onManagePermissions({ getSource: function() { 
            return { getBindingContext: function() { 
              return { getObject: function() { return selectedUser; } }; 
            }}; 
          }});
        })
        .catch(function(err) {
          MessageBox.error("Failed to assign permission: " + err.message);
        });
    },

    onRemovePermission: function() {
      var that = this;
      var selectedUser = this.getView().getModel().getProperty("/selectedUser");
      var permissionSelect = this.byId("permissionSelect");
      var permissionId = permissionSelect.getSelectedKey();
      
      if (!selectedUser || !selectedUser.id) {
        MessageBox.warning("Please select a user first.");
        return;
      }
      
      if (!permissionId) {
        MessageBox.warning("Please select a permission to remove.");
        return;
      }
      
      PermissionService.removePermission(selectedUser.id, permissionId)
        .then(function() {
          MessageBox.success("Permission removed successfully!");
          that.loadData(); // Refresh the data
          that.onManagePermissions({ getSource: function() { 
            return { getBindingContext: function() { 
              return { getObject: function() { return selectedUser; } }; 
            }}; 
          }});
        })
        .catch(function(err) {
          MessageBox.error("Failed to remove permission: " + err.message);
        });
    },

    onRefreshData: function() {
      this.loadData();
      MessageBox.success("Data refreshed successfully!");
    },
    onGoToAdminDashboard: function() {
  this.getRouter().navTo("admin-dashboard");
},

    onLogout: function() {
      AuthService.logout()
        .then(function() {
          window.location.replace("http://localhost:8080/test/flpSandbox.html?sap-ui-xx-viewCache=false#app-tile");
        })
        .catch(function(err) {
          MessageBox.error("Logout failed: " + err.message);
        });
    }
  });
});