sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function(Controller, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("exam.controller.SuperAdminResetPassword", {
        onInit: function() {
    const oModel = new sap.ui.model.json.JSONModel({
        email: "",
        otp: "",
        newPassword: "",
        otpToken: ""
    });
    this.getView().setModel(oModel);

    // Get token from URL query parameter 'token'
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
        this.getView().getModel().setProperty("/otpToken", token);
    }
},


        _onRouteMatched: function(oEvent) {
            const token = oEvent.getParameter("arguments").token;
            this.getView().getModel().setProperty("/otpToken", token);
        },

        onSendOtp: function() {
            const data = this.getView().getModel().getData();
            fetch("http://localhost:4000/api/superadmin/request-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: data.email })
            })
            .then(res => res.json())
            .then(res => {
                if (res.otpToken) {
                    data.otpToken = res.otpToken;
                    this.getView().getModel().refresh();
                }
                if (res.message && res.message.toLowerCase().includes("sent")) {
                    MessageToast.show(res.message);
                } else if (!res.otpToken) {
                    MessageBox.error(res.message || "Failed to send OTP");
                }
            })
            .catch(err => {
                console.error(err);
                MessageBox.error("Something went wrong. Please try again.");
            });
        },

        onVerifyOtp: function() {
            const data = this.getView().getModel().getData();
            fetch("http://localhost:4000/api/superadmin/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ otpToken: data.otpToken, otp: data.otp })
            })
            .then(res => res.json())
            .then(res => {
                if (res.message.includes("successfully")) {
                    MessageToast.show("OTP Verified, you can now reset password");
                } else {
                    MessageBox.error(res.message);
                }
            });
        },

        onResetPassword: function() {
            const data = this.getView().getModel().getData();
            if (!data.newPassword) {
                return MessageBox.error("Please enter a new password.");
            }
            fetch("http://localhost:4000/api/superadmin/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: data.otpToken, password: data.newPassword })
            })
            .then(res => res.json())
            .then(res => {
                if (res.message && res.message.toLowerCase().includes("success")) {
                    MessageToast.show("Password reset successfully. Please login.");
                    this.getRouter().navTo("login");  // Redirect to login
                } else {
                    MessageBox.error(res.message || "Failed to reset password");
                }
            })
            .catch(err => {
                console.error(err);
                MessageBox.error("Something went wrong. Please try again.");
            });
        },

        getRouter: function() {
            return sap.ui.core.UIComponent.getRouterFor(this);
        }
    });
});
