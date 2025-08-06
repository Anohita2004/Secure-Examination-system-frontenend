sap.ui.define([
  "./BaseController",
  "sap/ui/model/json/JSONModel",
  
], function (BaseController, JSONModel) {
  "use strict";

  return BaseController.extend("exam.controller.Main", {
    onInit: function () {
      this._avatars = [
        {
          role: "Admin",
          avatar: "images/admin.jpg",
          route: "login-admin",
          description: "Manage exams, users, and system settings"
        },
        {
          role: "Employee",
          avatar: "images/employee.jpg",
          route: "login-employee",
          description: "Take exams and view your results"
        }
      ];

      this._currentIndex = 0;
      this.getView().setModel(new JSONModel({
        selected: this._avatars[this._currentIndex],
        currentIndex: this._currentIndex,
        totalRoles: this._avatars.length
      }));
    },

    onNextAvatar: function () {
      this._currentIndex = (this._currentIndex + 1) % this._avatars.length;
      this._updateAvatar();
      this._updateRoleIndicators();
    },

    onPreviousAvatar: function () {
      this._currentIndex =
        (this._currentIndex - 1 + this._avatars.length) % this._avatars.length;
      this._updateAvatar();
      this._updateRoleIndicators();
    },

    _updateAvatar: function () {
      const oModel = this.getView().getModel();
      oModel.setProperty("/selected", this._avatars[this._currentIndex]);
      oModel.setProperty("/currentIndex", this._currentIndex);
    },

    _updateRoleIndicators: function () {
      // This will be handled by the view binding
      const oModel = this.getView().getModel();
      oModel.setProperty("/currentIndex", this._currentIndex);
    },

    onLoginContinue: function () {
      const selectedRole = this._avatars[this._currentIndex];
      
      // Add a small delay for smooth transition
      setTimeout(() => {
        this.getRouter().navTo(selectedRole.route);
      }, 200);
    },

    onAvatarClick: function () {
      // Optional: Add click functionality to avatar
      this.onNextAvatar();
    }
  });
});