sap.ui.define([
  "exam/controller/BaseController",
  "exam/model/AuthService",
  "exam/model/PermissionService",
  "sap/m/MessageBox"
], function (BaseController, AuthService, PermissionService, MessageBox) {
  "use strict";

  return BaseController.extend("exam.controller.SuperAdminDashboard", {
    onInit: function () {
      AuthService.getCurrentUser()
        .then(function (user) {
          if (!user || String(user.role).toLowerCase() !== "super_admin") {
            MessageBox.error("Only Super Admins can access this dashboard.");
            this.getOwnerComponent().getRouter().navTo("login-admin");
            return;
          }
          this.getView().setModel(new sap.ui.model.json.JSONModel(user), "user");
          this.getView().setModel(new sap.ui.model.json.JSONModel({}), "dashboardModel");
          this.loadDashboardStats();
          this.loadData();
        }.bind(this))
        .catch(function () {
          MessageBox.error("Unauthorized. Please log in again.");
          this.getOwnerComponent().getRouter().navTo("login-admin");
        }.bind(this));
    },

    loadDashboardStats: function () {
      const that = this;
      fetch("http://localhost:4000/api/dashboard/stats", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          const model = that.getView().getModel("dashboardModel");
          model.setProperty("/userCount", data.userCount);
          model.setProperty("/permissionCount", data.permissionCount);
          model.setProperty("/adminCount", data.adminCount);
          model.setProperty("/employeeCount", data.employeeCount);
        })
        .catch(err => {
          MessageBox.error("Failed to load dashboard stats: " + err.message);
        });
    },

    loadData: function () {
      const that = this;
      const model = that.getView().getModel("dashboardModel");

      PermissionService.getAllUsersWithPermissions()
        .then(function (users) {
          model.setProperty("/users", users);
        })
        .catch(function (err) {
          if (err && err.status === 403) {
            MessageBox.error("Forbidden: You do not have access to view users. Please log in as Super Admin.");
          } else {
            MessageBox.error("Failed to load users: " + err.message);
          }
        });

      PermissionService.getAllPermissions()
        .then(function (permissions) {
          model.setProperty("/permissions", permissions);
        })
        .catch(function (err) {
          if (err && err.status === 403) {
            MessageBox.error("Forbidden: You do not have access to permissions. Please log in as Super Admin.");
          } else {
            MessageBox.error("Failed to load permissions: " + err.message);
          }
        });
    },

    onManagePermissions: function (oEvent) {
      const oContext = oEvent.getSource().getParent().getBindingContext("dashboardModel");
      if (!oContext) {
        sap.m.MessageBox.error("No user context found.");
        return;
      }
      const user = oContext.getObject();
      const userId = user.id || user.userId;
      if (!userId) {
        sap.m.MessageBox.error("User ID missing for permission lookup.");
        return;
      }

      PermissionService.getUserPermissions(userId)
        .then(function (permissions) {
          const model = this.getView().getModel("dashboardModel");
          model.setProperty("/selectedUser", Object.assign({}, user, { permissions: permissions }));
        }.bind(this))
        .catch(function (err) {
          MessageBox.error("Failed to load user permissions: " + err.message);
        });
    },

    onAssignPermission: function () {
      const model = this.getView().getModel("dashboardModel");
      const selectedUser = model.getProperty("/selectedUser");
      const permissionId = this.byId("permissionSelect").getSelectedKey();

      const userId = selectedUser && (selectedUser.id || selectedUser.userId);
      if (!userId) {
        sap.m.MessageBox.warning("Please select a user first.");
        return;
      }
      if (!permissionId) {
        sap.m.MessageBox.warning("Please select a permission to assign.");
        return;
      }

      PermissionService.assignPermission(userId, permissionId)
        .then(function () {
          sap.m.MessageBox.success("Permission assigned successfully!");
          this.onManagePermissions({
            getSource: function () {
              return {
                getParent: function () {
                  return {
                    getBindingContext: function () {
                      return { getObject: function () { return selectedUser; } };
                    }
                  };
                }
              };
            }
          });
          this.loadData();
        }.bind(this))
        .catch(function (err) {
          sap.m.MessageBox.error("Failed to assign permission: " + err.message);
        });
    },

    onRemovePermission: function () {
      const model = this.getView().getModel("dashboardModel");
      const selectedUser = model.getProperty("/selectedUser");
      const permissionId = this.byId("permissionSelect").getSelectedKey();

      const userId = selectedUser && (selectedUser.id || selectedUser.userId);
      if (!userId) {
        MessageBox.warning("Please select a user first.");
        return;
      }
      if (!permissionId) {
        MessageBox.warning("Please select a permission to remove.");
        return;
      }

      PermissionService.removePermission(userId, permissionId)
        .then(function () {
          MessageBox.success("Permission removed successfully!");
          this.onManagePermissions({
            getSource: function () {
              return {
                getParent: function () {
                  return {
                    getBindingContext: function () {
                      return { getObject: function () { return selectedUser; } };
                    }
                  };
                }
              };
            }
          });
          this.loadData();
        }.bind(this))
        .catch(function (err) {
          MessageBox.error("Failed to remove permission: " + err.message);
        }.bind(this));
    },

    onRefreshData: function () {
      this.loadData();
      MessageBox.success("Data refreshed successfully!");
    },

    onGoToAdminDashboard: function () {
      this.getRouter().navTo("admin-dashboard");
    },

    onGoToAnalytics: function () {
      this.getRouter().navTo("analytics-dashboard");
    },

    onLogout: function () {
      AuthService.logout()
        .then(function () { this.getRouter().navTo("login-admin"); }.bind(this))
        .catch(function (err) { MessageBox.error("Logout failed: " + err.message); });
    },

    formatPermissions: function (permissions) {
      if (!permissions || !permissions.length) { return ""; }
      return permissions.map(function (p) { return typeof p === "string" ? p : p.name; }).join(", ");
    }
  });
});
