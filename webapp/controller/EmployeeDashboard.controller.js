/*sap.ui.define([
  "./BaseController",
  "sap/m/MessageBox",
  "exam/model/ExamService",
  "exam/model/AuthService"
], function (BaseController, MessageBox, ExamService, AuthService) {
  "use strict";
  return BaseController.extend("exam.controller.EmployeeDashboard", {
    onInit: function () {
      var that = this;
      AuthService.getCurrentUser()
        .then(function(user) {
          var userModel = new sap.ui.model.json.JSONModel(user);
          that.getView().setModel(userModel, "user");
          var userId = user.id;
          return ExamService.getAssignedExams(userId);
        })
        .then(function(data) {
          const unattempted = data.filter(e => e.attempted === 0);
          const attempted = data.filter(e => e.attempted === 1);
          const model = new sap.ui.model.json.JSONModel({
            unattempted: unattempted,
            attempted: attempted
          });
          that.getView().setModel(model, "exams");
        })
        .catch(function(err) {
          MessageBox.error("Failed to load exams: " + err.message);
          that.getRouter().navTo("login-employee");
        });
    },

    onStartExam: function (oEvent) {
      const oExam = oEvent.getSource().getBindingContext("exams").getObject();
      if (oExam.attempted === 1) {
        MessageBox.warning("You have already attempted this exam. Reattempt is not permitted.");
        return;
      }
      const examId = oExam.id;
      const user = this.getView().getModel("user").getData();
      const url = `${window.location.origin}/index.html?examId=${encodeURIComponent(examId)}`;
      const examWindow = window.open(
        url,
        "_blank",
        "toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,fullscreen=yes"
      );
      if (examWindow) {
        examWindow.focus();
      } else {
        MessageBox.error("Popup blocked! Please allow popups for this site.");
      }
    },

    onLogout: function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      // Optionally call AuthService.logout() here
      window.location.replace("http://localhost:8080/test/flpSandbox.html?sap-ui-xx-viewCache=false#app-tile");
    }
  });
});*/



/*sap.ui.define([
  "./BaseController",
  "sap/m/MessageBox",
  "exam/model/ExamService",
  "exam/model/AuthService"
], function (BaseController, MessageBox, ExamService, AuthService) {
  "use strict";
  return BaseController.extend("exam.controller.EmployeeDashboard", {
    onInit: function () {
      var that = this;
      AuthService.getCurrentUser()
        .then(function(user) {
          var userModel = new sap.ui.model.json.JSONModel(user);
          that.getView().setModel(userModel, "user");
          var userId = user.id;
          return ExamService.getAssignedExams(userId);
        })
        .then(function(data) {
          const unattempted = data.filter(e => e.attempted === 0);
          const attempted = data.filter(e => e.attempted === 1);
          const model = new sap.ui.model.json.JSONModel({
            unattempted: unattempted,
            attempted: attempted
          });
          that.getView().setModel(model, "exams");
        })
        .catch(function(err) {
          MessageBox.error("Failed to load exams: " + err.message);
          that.getRouter().navTo("login-employee");
        });
    },

    onStartExam: function (oEvent) {
      const oExam = oEvent.getSource().getBindingContext("exams").getObject();
      if (oExam.attempted === 1) {
        MessageBox.warning("You have already attempted this exam. Reattempt is not permitted.");
        return;
      }
      const examId = oExam.id;
      const user = this.getView().getModel("user").getData();
     /* const url = `${window.location.origin}/index.html#/exam/${encodeURIComponent(examId)}`;
      const examWindow = window.open(
        url,
        "_blank",
        "toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,fullscreen=yes"
      );
      if (examWindow) {
        examWindow.focus();
      } else {
        MessageBox.error("Popup blocked! Please allow popups for this site.");
      }*/
    // this.getRouter().navTo("exam", { examId: examId });
    //},

   // onLogout: function () {
     // if (document.fullscreenElement) {
      //  document.exitFullscreen();
     // }
      // Optionally call AuthService.logout() here
     // window.location.replace("http://localhost:8080/test/flpSandbox.html?sap-ui-xx-viewCache=false#app-tile");
   // }
 // });
//});*/
/*sap.ui.define([
  "./BaseController",
  "sap/m/MessageBox",
  "exam/model/ExamService",
  "exam/model/AuthService"
], function (BaseController, MessageBox, ExamService, AuthService) {
  "use strict";
  return BaseController.extend("exam.controller.EmployeeDashboard", {
    onInit: function () {
      var that = this;
      AuthService.getCurrentUser()
        .then(function(user) {
          var userModel = new sap.ui.model.json.JSONModel(user);
          that.getView().setModel(userModel, "user");
          var userId = user.id;
          return ExamService.getAssignedExams(userId);
        })
        .then(function(data) {
          const unattempted = data.filter(e => e.attempted === 0);
          const attempted = data.filter(e => e.attempted === 1);
          const model = new sap.ui.model.json.JSONModel({
            unattempted: unattempted,
            attempted: attempted
          });
          that.getView().setModel(model, "exams");
        })
        .catch(function(err) {
          MessageBox.error("Failed to load exams: " + err.message);
          that.getRouter().navTo("login-employee");
        });
    },

    onStartExam: function (oEvent) {
      const oExam = oEvent.getSource().getBindingContext("exams").getObject();
      if (oExam.attempted === 1) {
        MessageBox.warning("You have already attempted this exam. Reattempt is not permitted.");
        return;
      }
      const examId = oExam.id;
      this.getRouter().navTo("exam", { examId: examId });
    },

    onLogout: function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      window.location.replace("http://localhost:8080/test/flpSandbox.html?sap-ui-xx-viewCache=false#app-tile");
    }
  });
});*/
/*sap.ui.define([
  "./BaseController",
  "sap/m/MessageBox",
  "exam/model/ExamService",
  "exam/model/AuthService"
], function (BaseController, MessageBox, ExamService, AuthService) {
  "use strict";
  return BaseController.extend("exam.controller.EmployeeDashboard", {
    onInit: function () {
      var that = this;
      AuthService.getCurrentUser()
        .then(function(user) {
          // Add initials for avatar
          user.initials = user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase() : "";
          var userModel = new sap.ui.model.json.JSONModel(user);
          that.getView().setModel(userModel, "user");
          var userId = user.id;
          that._fetchResults(user.id);
          return ExamService.getAssignedExams(userId);
        })
        .then(function(data) {
          const unattempted = data.filter(e => e.attempted === 0);
          const attempted = data.filter(e => e.attempted === 1);
          // Subject-wise breakdown
          const subjectMap = {};
          data.forEach(e => {
            if (!subjectMap[e.subject]) subjectMap[e.subject] = 0;
            subjectMap[e.subject]++;
          });
          const subjectBreakdown = Object.keys(subjectMap).map(subject => ({
            subject,
            count: subjectMap[subject]
          }));
          const model = new sap.ui.model.json.JSONModel({
            unattempted: unattempted,
            attempted: attempted,
            subjectBreakdown: subjectBreakdown
          });
          that.getView().setModel(model, "exams");
        })
        .catch(function(err) {
          MessageBox.error("Failed to load exams: " + err.message);
          that.getRouter().navTo("login-employee");
        });
    },

    // Card click handlers
    onGoToUnattempted: function () {
      var examsModel = this.getView().getModel("exams");
      if (!examsModel) {
        sap.m.MessageBox.error("Exam data not loaded yet.");
        return;
      }
      var exams = examsModel.getProperty("/unattempted");
      if (!exams || exams.length === 0) {
        sap.m.MessageBox.information("No unattempted exams.");
        return;
      }
      this._showExamListDialog("Unattempted Exams", exams, false);
    },
    onGoToAttempted: function () {
      var examsModel = this.getView().getModel("exams");
      if (!examsModel) {
        sap.m.MessageBox.error("Exam data not loaded yet.");
        return;
      }
      var exams = examsModel.getProperty("/attempted");
      if (!exams || exams.length === 0) {
        sap.m.MessageBox.information("No attempted exams.");
        return;
      }
      this._showExamListDialog("Attempted Exams", exams, true);
    },
    onGoToResults: function () {
  var results = this.getView().getModel("results")?.getData();
  if (!results || results.length === 0) {
    sap.m.MessageBox.information("No results available yet.");
    return;
  }
  var items = results.map(function(r) {
    return new sap.m.StandardListItem({
      title: r.examTitle,
      description: `Score: ${r.total_score} | ${r.passed ? "Passed" : "Failed"}`,
      info: new Date(r.evaluated_at).toLocaleString()
    });
  });
  var dialog = new sap.m.Dialog({
    title: "Your Results",
    content: [
      new sap.m.List({
        items: items
      })
    ],
    endButton: new sap.m.Button({
      text: "Close",
      press: function() { dialog.close(); }
    })
  });
  dialog.open();
},
    onLogout: function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      window.location.replace("http://localhost:8080/test/flpSandbox.html?sap-ui-xx-viewCache=false#app-tile");
    },
   onOpenChangePasswordDialog: function() {
  var dialog = new sap.m.Dialog({
    title: "Change Password",
    content: [
      new sap.m.Label({ text: "Old Password" }),
      new sap.m.Input("oldPasswordInput", { type: "Password" }),
      new sap.m.Label({ text: "New Password" }),
      new sap.m.Input("newPasswordInput", { type: "Password" }),
      new sap.m.Label({ text: "Confirm New Password" }),
      new sap.m.Input("confirmPasswordInput", { type: "Password" })
    ],
    beginButton: new sap.m.Button({
      text: "Change",
      press: function() {
        var oldPassword = sap.ui.getCore().byId("oldPasswordInput").getValue();
        var newPassword = sap.ui.getCore().byId("newPasswordInput").getValue();
        var confirmPassword = sap.ui.getCore().byId("confirmPasswordInput").getValue();
        if (!oldPassword || !newPassword || !confirmPassword) {
          sap.m.MessageBox.error("All fields are required.");
          return;
        }
        if (newPassword !== confirmPassword) {
          sap.m.MessageBox.error("New passwords do not match.");
          return;
        }
        // Get user_id from model
        var user = this.getView().getModel("user").getData();
        fetch("http://localhost:4000/api/user/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            old_password: oldPassword,
            new_password: newPassword
          }),
          credentials: "include"
        })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            sap.m.MessageBox.error(data.error);
          } else {
            sap.m.MessageBox.success("Password changed successfully!");
            dialog.close();
          }
        })
        .catch(err => {
          sap.m.MessageBox.error("Error: " + err.message);
        });
      }.bind(this)
    }),
    endButton: new sap.m.Button({
      text: "Cancel",
      press: function() { dialog.close(); }
    })
  });
  dialog.open();
},
    // Helper to show exam list dialog
    _showExamListDialog: function(title, exams, attempted) {
      var that = this;
      var items = exams.map(function(e) {
        return new sap.m.StandardListItem({
          title: e.title,
          description: e.subject,
          info: attempted ? "Attempted" : "Unattempted",
          type: attempted ? "Inactive" : "Active",
          press: function() {
            if (!attempted) {
              that.getRouter().navTo("exam", { examId: e.id });
            }
          }
        });
      });
      var dialog = new sap.m.Dialog({
        title: title,
        content: [
          new sap.m.List({
            items: items
          })
        ],
        endButton: new sap.m.Button({
          text: "Close",
          press: function() { dialog.close(); }
        })
      });
      dialog.open();
    },
    _fetchResults: function(userId) {
  var that = this;
  return fetch(`http://localhost:4000/api/user/${userId}/results`, {
    credentials: "include"
  })
    .then(res => res.json())
    .then(data => {
      var resultsModel = new sap.ui.model.json.JSONModel(data);
      that.getView().setModel(resultsModel, "results");
      return data;
    })
    .catch(err => {
      sap.m.MessageBox.error("Failed to load results: " + err.message);
    });
},
  });
});*/
sap.ui.define([
  "./BaseController",
  "sap/m/MessageBox",
  "exam/model/ExamService",
  "exam/model/AuthService"
], function (BaseController, MessageBox, ExamService, AuthService) {
  "use strict";
  return BaseController.extend("exam.controller.EmployeeDashboard", {
    onInit: function () {
      var that = this;
      AuthService.getCurrentUser()
        .then(function(user) {
          // Add initials for avatar
          user.initials = user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase() : "";
          var userModel = new sap.ui.model.json.JSONModel(user);
          that.getView().setModel(userModel, "user");
          var userId = user.id;
          that._fetchResults(user.id);
          return ExamService.getAssignedExams(userId);
        })
        .then(function(data) {
          const unattempted = data.filter(e => e.attempted === 0);
          const attempted = data.filter(e => e.attempted === 1);
          // Subject-wise breakdown
          const subjectMap = {};
          data.forEach(e => {
            if (!subjectMap[e.subject]) subjectMap[e.subject] = 0;
            subjectMap[e.subject]++;
          });
          const subjectBreakdown = Object.keys(subjectMap).map(subject => ({
            subject,
            count: subjectMap[subject]
          }));
          const model = new sap.ui.model.json.JSONModel({
            unattempted: unattempted,
            attempted: attempted,
            subjectBreakdown: subjectBreakdown
          });
          that.getView().setModel(model, "exams");
        })
        .catch(function(err) {
          MessageBox.error("Failed to load exams: " + err.message);
          that.getRouter().navTo("login-employee");
        });
    },

    // Card click handlers
    onGoToUnattempted: function () {
      var examsModel = this.getView().getModel("exams");
      if (!examsModel) {
        sap.m.MessageBox.error("Exam data not loaded yet.");
        return;
      }
      var exams = examsModel.getProperty("/unattempted");
      if (!exams || exams.length === 0) {
        sap.m.MessageBox.information("No unattempted exams.");
        return;
      }
      this._showExamListDialog("Unattempted Exams", exams, false);
    },

    onGoToAttempted: function () {
      var examsModel = this.getView().getModel("exams");
      if (!examsModel) {
        sap.m.MessageBox.error("Exam data not loaded yet.");
        return;
      }
      var exams = examsModel.getProperty("/attempted");
      if (!exams || exams.length === 0) {
        sap.m.MessageBox.information("No attempted exams.");
        return;
      }
      this._showExamListDialog("Attempted Exams", exams, true);
    },

    onGoToResults: function () {
      var results = this.getView().getModel("results")?.getData();
      if (!results || results.length === 0) {
        sap.m.MessageBox.information("No results available yet.");
        return;
      }
      var items = results.map(function(r) {
        return new sap.m.StandardListItem({
          title: r.examTitle,
          description: `Score: ${r.total_score} | ${r.passed ? "Passed" : "Failed"}`,
          info: new Date(r.evaluated_at).toLocaleString()
        });
      });
      var dialog = new sap.m.Dialog({
        title: "Your Results",
        content: [
          new sap.m.List({
            items: items
          })
        ],
        endButton: new sap.m.Button({
          text: "Close",
          press: function() { dialog.close(); }
        })
      });
      dialog.open();
    },

    onLogout: function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      /*window.location.replace("http://localhost:8080/test/flpSandbox.html?sap-ui-xx-viewCache=false#app-tile");*/
      this.getRouter().navTo("main");
    },

    onOpenChangePasswordDialog: function() {
      var dialog = new sap.m.Dialog({
        title: "Change Password",
        content: [
          new sap.m.Label({ text: "Old Password" }),
          new sap.m.Input("oldPasswordInput", { type: "Password" }),
          new sap.m.Label({ text: "New Password" }),
          new sap.m.Input("newPasswordInput", { type: "Password" }),
          new sap.m.Label({ text: "Confirm New Password" }),
          new sap.m.Input("confirmPasswordInput", { type: "Password" })
        ],
        beginButton: new sap.m.Button({
          text: "Change",
          press: function() {
            var oldPassword = sap.ui.getCore().byId("oldPasswordInput").getValue();
            var newPassword = sap.ui.getCore().byId("newPasswordInput").getValue();
            var confirmPassword = sap.ui.getCore().byId("confirmPasswordInput").getValue();
            if (!oldPassword || !newPassword || !confirmPassword) {
              sap.m.MessageBox.error("All fields are required.");
              return;
            }
            if (newPassword !== confirmPassword) {
              sap.m.MessageBox.error("New passwords do not match.");
              return;
            }
            // Get user_id from model
            var user = this.getView().getModel("user").getData();
            fetch("http://localhost:4000/api/user/change-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_id: user.id,
                old_password: oldPassword,
                new_password: newPassword
              }),
              credentials: "include"
            })
            .then(res => res.json())
            .then(data => {
              if (data.error) {
                sap.m.MessageBox.error(data.error);
              } else {
                sap.m.MessageBox.success("Password changed successfully!");
                dialog.close();
              }
            })
            .catch(err => {
              sap.m.MessageBox.error("Error: " + err.message);
            });
          }.bind(this)
        }),
        endButton: new sap.m.Button({
          text: "Cancel",
          press: function() { dialog.close(); }
        })
      });
      dialog.open();
    },

    // Helper to show exam list dialog
    _showExamListDialog: function(title, exams, attempted) {
      var that = this;
      var items = exams.map(function(e) {
        return new sap.m.StandardListItem({
          title: e.title,
          description: e.subject,
          info: attempted ? "Attempted" : "Unattempted",
          type: attempted ? "Inactive" : "Active",
          press: function() {
            if (!attempted) {
              that.getRouter().navTo("exam", { examId: e.id });
            }
          }
        });
      });
      var dialog = new sap.m.Dialog({
        title: title,
        content: [
          new sap.m.List({
            items: items
          })
        ],
        endButton: new sap.m.Button({
          text: "Close",
          press: function() { dialog.close(); }
        })
      });
      dialog.open();
    },

    _fetchResults: function(userId) {
      var that = this;
      return fetch(`http://localhost:4000/api/user/${userId}/results`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          var resultsModel = new sap.ui.model.json.JSONModel(data);
          that.getView().setModel(resultsModel, "results");
          return data;
        })
        .catch(err => {
          sap.m.MessageBox.error("Failed to load results: " + err.message);
        });
    }
  });
});
