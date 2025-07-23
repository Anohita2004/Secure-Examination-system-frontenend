sap.ui.define([
  "./BaseController",
  "sap/m/MessageBox",
  "sap/ui/core/Fragment",
  "exam/model/ExamService",
  "exam/model/AuthService",
  "sap/ui/model/json/JSONModel"
  ], function (BaseController, MessageBox, Fragment, ExamService, AuthService, JSONModel) {
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
        window.addEventListener("popstate", this._onBrowserBack = function() {
        that.onLogout();});
        this._examData = [];
        this.loadExamCalendar();
        // Initialize calendar model
  const oCalendarModel = new sap.ui.model.json.JSONModel([]);
  this.getView().setModel(oCalendarModel, "calendarModel");
  this.loadAnnouncements();




    },
    onCalendarSelect: function (oEvent) {
  const oCalendar = oEvent.getSource();
  const selectedDate = oCalendar.getSelectedDates()[0].getStartDate();

  const yyyyMMdd = selectedDate.toISOString().split('T')[0];

  fetch(`http://localhost:4000/api/exams/calendar/${yyyyMMdd}`)

    .then(response => response.json())
    .then(data => {
      this.getView().getModel("calendarModel").setData(data);
    })
    .catch(err => {
      console.error("Failed to fetch calendar data", err);
      sap.m.MessageToast.show("Failed to load exams.");
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
    onExit: function() {
  if (this._onBrowserBack) {
    window.removeEventListener("popstate", this._onBrowserBack);
  }
},
onOpenAnnouncementDialog: function () {
  const that = this;

  // Load announcements first
  fetch("http://localhost:4000/api/announcements")
    .then(res => res.json())
    .then(data => {
      const oModel = new JSONModel(data);
      that.getView().setModel(oModel, "announcements");

      // Load dialog fragment
      if (!that._pDialog) {
        Fragment.load({
          name: "exam.view.AnnouncementDialog", // replace with actual namespace
          controller: that
        }).then(function (oDialog) {
          that._pDialog = oDialog;
          that.getView().addDependent(oDialog);
          oDialog.open();
        });
      } else {
        that._pDialog.open();
      }
    })
    .catch(err => {
      console.error("Error fetching announcements", err);
      MessageBox.error("Could not load announcements.");
    });
},

onCloseAnnouncementDialog: function () {
  if (this._pDialog) {
    this._pDialog.close();
  }
}
,
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

    onEditProfile: function() {
  this.byId("profileDialog").open();
},

onSaveProfile: function() {
  var userModel = this.getView().getModel("user");
  var updatedData = userModel.getData();
  // TODO: Call backend service to save updated profile
  // Example: AuthService.updateProfile(updatedData).then(...)
  this.byId("profileDialog").close();
  sap.m.MessageToast.show("Profile updated!");
},

onCancelProfile: function() {
  this.byId("profileDialog").close();
},
loadExamCalendar: function () {
  const that = this;
  fetch("/api/exams") // ← Use your existing endpoint here
    .then(res => res.json())
    .then(data => {
      // Optional: convert all dates to YYYY-MM-DD format
      data.forEach(exam => {
        exam.date = new Date(exam.date).toISOString().split("T")[0];
      });
      that._examData = data;
    })
    .catch(err => {
      console.error("Error loading exam data:", err);
    });
},
loadAnnouncements: function () {
  fetch("http://localhost:4000/api/announcements")
    .then(res => res.json())
    .then(data => {
      const oModel = new sap.ui.model.json.JSONModel(data);
      this.getView().setModel(oModel, "announcements");
    })
    .catch(err => {
      console.error("Error loading announcements", err);
    });
}

,

onDateSelect: function (oEvent) {
  const oCalendar = oEvent.getSource();
  const aSelectedDates = oCalendar.getSelectedDates();

  if (aSelectedDates.length) {
    const oSelectedDate = aSelectedDates[0].getStartDate();
    const sFormattedDate = this._formatDate(oSelectedDate); // "2025-07-22"

    // Simulate or fetch exams for the selected date
    const aExams = this._getExamsForDate(sFormattedDate); // static for now
    const oModel = new sap.ui.model.json.JSONModel(aExams);
    this.getView().setModel(oModel, "calendar");
  }
},

_formatDate: function (oDate) {
  const year = oDate.getFullYear();
  const month = String(oDate.getMonth() + 1).padStart(2, "0");
  const day = String(oDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
},

_getExamsForDate: function (dateString) {
  const mockData = {
    "2025-07-22": [
      { title: "Java Final", time: "10:00 AM", status: "Upcoming" },
      { title: "Database Systems", time: "2:00 PM", status: "Upcoming" }
    ],
    "2025-07-23": [
      { title: "SAP ABAP", time: "11:00 AM", status: "Upcoming" }
    ]
  };

  return mockData[dateString] || [];
}
,

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