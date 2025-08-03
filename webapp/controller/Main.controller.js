sap.ui.define([
  "./BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox"
], function (BaseController, JSONModel, MessageBox) {
  "use strict";

  return BaseController.extend("exam.controller.Main", {
    onInit: function () {
      this._avatars = [
        
  {
    role: "Admin",
    avatar: "images/admin.jpg",
    route: "login-admin"
  },
  {
    role: "Employee",
    avatar: "images/employee.jpg",
    route: "login-employee"
  }
];

      

      this._currentIndex = 0;
      this.getView().setModel(new JSONModel({
        selected: this._avatars[this._currentIndex]
      }));
    },

    onNextAvatar: function () {
      this._currentIndex = (this._currentIndex + 1) % this._avatars.length;
      this._updateAvatar();
    },

    onPreviousAvatar: function () {
      this._currentIndex =
        (this._currentIndex - 1 + this._avatars.length) % this._avatars.length;
      this._updateAvatar();
    },

    _updateAvatar: function () {
      const oModel = this.getView().getModel();
      oModel.setProperty("/selected", this._avatars[this._currentIndex]);
    },

    onLoginContinue: function () {
      const selectedRole = this._avatars[this._currentIndex];
      this.getRouter().navTo(selectedRole.route);
    }
  });
});