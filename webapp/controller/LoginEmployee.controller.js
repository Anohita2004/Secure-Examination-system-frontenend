sap.ui.define([
  "./BaseController",
  "sap/m/MessageBox",
  "exam/model/AuthService"
], function(BaseController, MessageBox, AuthService) {
  "use strict";
  return BaseController.extend("exam.controller.LoginEmployee", {
    onLogin: function() {
  var email = this.byId("email").getValue();
  var password = this.byId("password").getValue();
  var that = this;
  AuthService.login(email, password)
    .then(() => AuthService.getCurrentUser())
    .then(user => {
  var userModel = new sap.ui.model.json.JSONModel(user);
  that.getView().setModel(userModel, "user");
  if (user.role && user.role.toLowerCase() === "employee") {
    that.getRouter().navTo("employee-dashboard");
  } else {
    MessageBox.error("Not an employee account!");
  }
})
    .catch(err => MessageBox.error("Login failed: " + err.message));
},
onTogglePassword: function(oEvent) {
  var bSelected = oEvent.getParameter("selected");
  var oPasswordInput = this.byId("password");
  oPasswordInput.setType(bSelected ? "Text" : "Password");
},
onForgotPassword: function() {
  var dialog = new sap.m.Dialog({
    title: "Forgot Password",
    content: [
      new sap.m.Label({ text: "Enter your email address:" }),
      new sap.m.Input("forgotEmailInput", { type: "Email" })
    ],
    beginButton: new sap.m.Button({
      text: "Send Reset Link",
      press: function() {
        var email = sap.ui.getCore().byId("forgotEmailInput").getValue();
        if (!email) {
          sap.m.MessageBox.error("Please enter your email.");
          return;
        }
        fetch("http://localhost:4000/api/user/request-password-reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email })
        })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            sap.m.MessageBox.error(data.error);
          } else {
            sap.m.MessageBox.success("If your email is registered, a reset link has been sent.");
            dialog.close();
          }
        })
        .catch(err => {
          sap.m.MessageBox.error("Error: " + err.message);
        });
      }
    }),
    endButton: new sap.m.Button({
      text: "Cancel",
      press: function() { dialog.close(); }
    })
  });
  dialog.open();
}
    /*onLogin: function() {
      console.log("Login pressed");  
      var email = this.byId("email").getValue();
      var password = this.byId("password").getValue();
      console.log(email, password); // Add this
      AuthService.login(email, password).then(data => {
        if (data.role === "employee") {
          this.getRouter().navTo("employee-dashboard");
        } else {
          MessageBox.error("Not an employee account!");
        }
      }).catch(err => MessageBox.error("Login failed: " + err.message));
    }*/
  });
});