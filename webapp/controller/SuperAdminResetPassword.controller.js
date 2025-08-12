sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function(Controller, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("exam.controller.SuperAdminResetPassword", {
        onInit: function() {
            this.getView().setModel(new sap.ui.model.json.JSONModel({
                email: "",
                otp: "",
                newPassword: "",
                otpToken: ""
            }));
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
}
,

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
            // Here you’d call your reset-password API
            MessageToast.show("Password reset logic here...");
        }
    });
});
