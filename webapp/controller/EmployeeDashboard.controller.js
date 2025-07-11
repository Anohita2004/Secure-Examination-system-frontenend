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
      var exams = this.getView().getModel("exams").getProperty("/unattempted");
      this._showExamListDialog("Unattempted Exams", exams, false);
    },
    onGoToAttempted: function () {
      var exams = this.getView().getModel("exams").getProperty("/attempted");
      this._showExamListDialog("Attempted Exams", exams, true);
    },
    onGoToResults: function () {
      MessageBox.information("Results feature coming soon!");
    },
    onLogout: function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      window.location.replace("http://localhost:8080/test/flpSandbox.html?sap-ui-xx-viewCache=false#app-tile");
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
    }
  });
});