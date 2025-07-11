sap.ui.define(["./BaseController", "sap/m/MessageBox"], function (BaseController, MessageBox) {
	"use strict";

	return BaseController.extend("exam.controller.Main", {
		sayHello: function () {
			MessageBox.show("Hello World!");
		},
		onAdminLogin: function() {
  this.getRouter().navTo("login-admin");
},
onEmployeeLogin: function() {
  this.getRouter().navTo("login-employee");
}
	});
});
