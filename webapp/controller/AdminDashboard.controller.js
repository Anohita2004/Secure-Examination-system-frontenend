/*sap.ui.define([
  "./BaseController",
  "sap/m/MessageBox",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/m/Input",
  "sap/ui/model/json/JSONModel",
  "exam/model/ExamService",
  "exam/model/AuthService",
  "exam/model/PermissionChecker"
], function(BaseController, MessageBox, Dialog, Button, Input, JSONModel, ExamService, AuthService, PermissionChecker) {
  "use strict";

  /**
   *
   * @param user
   *//*
  function isSuperAdmin(user) {
    return user && user.role === "super_admin";
  }

  return BaseController.extend("exam.controller.AdminDashboard", {
    onInit: function () {
      const that = this;
      AuthService.getCurrentUser()
        .then(function(user) {
          if (!user) {
            MessageBox.error("User not authenticated. Please log in again.");
            that.getRouter().navTo("main");
            return;
          }
          const userModel = new sap.ui.model.json.JSONModel(user);
          that.getView().setModel(userModel, "user");
          const oModel = new sap.ui.model.json.JSONModel({});
          that.getView().setModel(oModel);
          return that.loadPermissionsAndSetupUI(user);
        })
        .catch(function(err) {
          MessageBox.error("Authentication failed: " + err.message);
          that.getRouter().navTo("main");
        });
        this.loadExams();
    },
    loadExams: function() {
    fetch("http://localhost:4000/api/exam/exams", { credentials: "include" })
      .then(res => res.json())
      .then((data) => {
        const examsModel = new sap.ui.model.json.JSONModel(data);
        this.getView().setModel(examsModel, "exams");
      });
  },

    loadPermissionsAndSetupUI: function(user) {
      const that = this;
      if (isSuperAdmin(user)) {
        return that.loadDashboardData();
      }
      return PermissionChecker.hasPermission(user.id, 'view_dashboard')
        .then(function(hasDashboardAccess) {
          if (!hasDashboardAccess) {
            MessageBox.error("Access denied. You don't have permission to view the dashboard.");
            that.getRouter().navTo("main");
            return;
          }
          return that.loadDashboardData();
        });
    },

    loadDashboardData: function() {
      const that = this;
      fetch("http://localhost:4000/api/dashboard/stats", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          const oModel = new sap.ui.model.json.JSONModel(data);
          that.getView().setModel(oModel, "dashboardModel");
        })
        .catch(err => console.error("Failed to load dashboard stats", err));
      // Optionally, handle users fetch if endpoint exists
      fetch("http://localhost:4000/api/users", { credentials: "include" })
        .then(res => {
          if (!res.ok) throw new Error("Users endpoint not found");
          return res.json();
        })
        .then(data => {
          const userModel = new sap.ui.model.json.JSONModel(data);
          that.getView().setModel(userModel, "users");
        })
        .catch(err => console.warn("Error loading users", err));
      const oTableModel = new JSONModel();
      that.getView().setModel(oTableModel, "tableModel");
      fetch("http://localhost:4000/api/dashboard/table", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          oTableModel.setData(data);
        })
        .catch(err => {
          console.error("Failed to load table data", err);
        });
    },

    onOpenCreateExamDialog: function() {
      const that = this;
      const userModel = this.getView().getModel("user");
      if (!userModel) {
        MessageBox.error("User information not loaded. Please log in again.");
        return;
      }
      const user = userModel.getData();
      if (isSuperAdmin(user)) {
        that._showCreateExamDialog();
        return;
      }
      PermissionChecker.hasPermission(user.id, 'create_exam')
        .then(function(hasPermission) {
          if (!hasPermission) {
            MessageBox.error("Access denied. You don't have permission to create exams.");
            return;
          }
          that._showCreateExamDialog();
        });
    },

    _showCreateExamDialog: function() {
      const that = this;
      const dialog = new Dialog({
        title: "Create Exam",
        content: [
          new Input("examTitle", { placeholder: "Title" }),
        new sap.m.ComboBox("examCategory", {
  placeholder: "Select Exam",
  items: {
    path: "exams>/",
    template: new sap.ui.core.Item({
      key: "{exams>id}",
      text: "{exams>title}"
    })
  }
}),
          new Input("examDescription", { placeholder: "Description" }),
          new Input("examDueDate", { placeholder: "Due Date (YYYY-MM-DD)" }),
          new sap.m.DatePicker("examStartDate", { placeholder: "Start Date" }),
          new sap.m.DatePicker("examEndDate", { placeholder: "End Date" }),
  

        ],
        beginButton: new Button({
          text: "Create",
          press: function() {
            const title = sap.ui.getCore().byId("examTitle").getValue();
            //const selectedExamId = sap.ui.getCore().byId("examCategory").getSelectedKey();
            const description = sap.ui.getCore().byId("examDescription").getValue();
            const dueDate = sap.ui.getCore().byId("examDueDate").getValue();
            const user = that.getView().getModel("user").getData();
            const createdBy = user.id;
            const startDate = sap.ui.getCore().byId("examStartDate").getValue();
            const endDate = sap.ui.getCore().byId("examEndDate").getValue();
            ExamService.createExam({ title, description, due_date: dueDate, created_by: createdBy, start_date: startDate, end_date: endDate})
              .then(() => MessageBox.success("Exam created!"))
              .catch(err => MessageBox.error("Error: " + err.message));
            dialog.close();
          }
        }),
        endButton: new Button({
          text: "Cancel",
          press: function() { dialog.close(); }
        })
      });
      dialog.open();
    },

    onOpenAddQuestionDialog: function() {
      const that = this;
      const userModel = this.getView().getModel("user");
      if (!userModel) {
        MessageBox.error("User information not loaded. Please log in again.");
        return;
      }
      const user = userModel.getData();
      if (isSuperAdmin(user)) {
        that._showAddQuestionDialog();
        return;
      }
      PermissionChecker.hasPermission(user.id, 'create_questions')
        .then(function(hasPermission) {
          if (!hasPermission) {
            MessageBox.error("Access denied. You don't have permission to create questions.");
            return;
          }
          that._showAddQuestionDialog();
        });
    },

    _showAddQuestionDialog: function() {
      const dialog = new Dialog({
        title: "Add Question",
        content: [
          new Input("questionExamId", { placeholder: "Exam ID" }),
          new Input("questionText", { placeholder: "Question Text" }),
          new Input("optionA", { placeholder: "Option A" }),
          new Input("optionB", { placeholder: "Option B" }),
          new Input("optionC", { placeholder: "Option C" }),
          new Input("optionD", { placeholder: "Option D" }),
          new Input("correctOption", { placeholder: "Correct Option (A/B/C/D)" })
        ],
        beginButton: new Button({
          text: "Add",
          press: function() {
            const exam_id = sap.ui.getCore().byId("questionExamId").getValue();
            const question_text = sap.ui.getCore().byId("questionText").getValue();
            const option_a = sap.ui.getCore().byId("optionA").getValue();
            const option_b = sap.ui.getCore().byId("optionB").getValue();
            const option_c = sap.ui.getCore().byId("optionC").getValue();
            const option_d = sap.ui.getCore().byId("optionD").getValue();
            const correct_option = sap.ui.getCore().byId("correctOption").getValue();
            ExamService.addQuestion({ exam_id, question_text, option_a, option_b, option_c, option_d, correct_option })
              .then(() => MessageBox.success("Question added!"))
              .catch(err => MessageBox.error("Error: " + err.message));
            dialog.close();
          }
        }),
        endButton: new Button({
          text: "Cancel",
          press: function() { dialog.close(); }
        })
      });
      dialog.open();
    },

    onOpenAssignExamDialog: function() {
      const that = this;
      const userModel = this.getView().getModel("user");
      if (!userModel) {
        MessageBox.error("User information not loaded. Please log in again.");
        return;
      }
      const user = userModel.getData();
      if (isSuperAdmin(user)) {
        that._showAssignExamDialog();
        return;
      }
      PermissionChecker.hasPermission(user.id, 'assign_exam')
        .then(function(hasPermission) {
          if (!hasPermission) {
            MessageBox.error("Access denied. You don't have permission to assign exams.");
            return;
          }
          that._showAssignExamDialog();
        });
    },

    _showAssignExamDialog: function() {
      const dialog = new Dialog({
        title: "Assign Exam",
        content: [
          new Input("assignExamId", { placeholder: "Exam ID" }),
          new Input("assignUserId", { placeholder: "User ID" }),
          new Input("assignEmail", { placeholder: "Employee Email" })
        ],
        beginButton: new Button({
          text: "Assign",
          press: function() {
            const exam_id = sap.ui.getCore().byId("assignExamId").getValue();
            const user_id = sap.ui.getCore().byId("assignUserId").getValue();
            const email = sap.ui.getCore().byId("assignEmail").getValue();
            ExamService.assignExam({ exam_id, user_id, email })
              .then(() => {
                MessageBox.success("Exam assigned!");
              })
              .catch(err => {
                MessageBox.error(err.error || err.message || "Could not assign exam.");
              });
            dialog.close();
          }
        }),
        endButton: new Button({
          text: "Cancel",
          press: function() { dialog.close(); }
        })
      });
      dialog.open();
    },

    onOpenResultsDialog: function() {
      const that = this;
      const userModel = this.getView().getModel("user");
      if (!userModel) {
        MessageBox.error("User information not loaded. Please log in again.");
        return;
      }
      const user = userModel.getData();
      if (isSuperAdmin(user)) {
        that._showResultsDialog();
        return;
      }
      PermissionChecker.hasPermission(user.id, 'view_results')
        .then(function(hasPermission) {
          if (!hasPermission) {
            MessageBox.error("Access denied. You don't have permission to view results.");
            return;
          }
          that._showResultsDialog();
        });
    },

    _showResultsDialog: function() {
      //const that = this;
      const examId = prompt("Enter Exam ID to view results:");
      if (!examId) return;
      ExamService.getAllExamResults(examId)
        .then(data => {
          const resultsText = data.map(r => r.name + ": " + r.score + "/" + r.total).join("\n");
          MessageBox.information(resultsText || "No results yet.");
        })
        .catch(err => MessageBox.error("Failed to load results: " + err.message));
    },
    onPostAnnouncement: function () {
  const title = this.byId("announceTitle").getValue().trim();
  const message = this.byId("announceMessage").getValue().trim();

  if (!title || !message) {
    sap.m.MessageBox.warning("Both title and message are required.");
    return;
  }

  fetch("http://localhost:4000/api/announcements", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ title, message })
  })
  .then(res => {
    if (!res.ok) {
      throw new Error("Failed to post announcement.");
    }
    return res.json();
  })
  .then(() => {
    sap.m.MessageToast.show("Announcement posted successfully!");
    this.byId("announceTitle").setValue("");
    this.byId("announceMessage").setValue("");
  })
  .catch(err => {
    console.error(err);
    sap.m.MessageBox.error("Error posting announcement.");
  });
}
,

    onLogout: function() {
      AuthService.logout()
        .then(function() {
          window.location.replace("http://localhost:8080/test/flpSandbox.html?sap-ui-xx-viewCache=false#app-tile");
        })
        .catch(function(err) {
          MessageBox.error("Logout failed: " + err.message);
        });
    }
  });
});*/
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "exam/model/AuthService",
    "exam/model/PermissionService",
    "exam/model/ExamService",
    "sap/m/MessageBox"
], function (Controller, AuthService, PermissionService, ExamService, MessageBox) {
    "use strict";

    return Controller.extend("exam.controller.AdminDashboard", {
        onInit: async function () {
            try {
                const user = await AuthService.getCurrentUser();

                // Expose the current user to the view for downstream checks
                this.getView().setModel(new sap.ui.model.json.JSONModel(user), "user");

                // Allow super admins full access to Admin Dashboard as well
                if (String(user.role).toLowerCase() === "super_admin") {
                    this._applyPermissions(["__ALL__"]);
                    return;
                }

                if (String(user.role).toLowerCase() !== "employee") {
                    MessageBox.error("Only employees can access Admin Dashboard.");
                    this.getOwnerComponent().getRouter().navTo("login-admin");
                    return;
                }

                // Prefer permissions coming from /auth/me (middleware attaches them)
                let permissions = Array.isArray(user.permissions) ? user.permissions : [];

                // Fallback: try fetching explicitly if we didn't get any, using either id or userId
                if (permissions.length === 0) {
                    const userId = user.id || user.userId;
                    if (!userId) {
                        console.warn("No user id found on current user.");
                    } else {
                        try {
                            permissions = await PermissionService.getUserPermissions(userId);
                        } catch (permErr) {
                            // If forbidden, keep empty and proceed; UI will hide restricted sections
                            console.warn("Failed to fetch user permissions", permErr);
                            permissions = [];
                        }
                    }
                }

                // Store permissions for later use
                this.getView().setModel(new sap.ui.model.json.JSONModel({ permissions }), "permModel");

                // Example: hide sections based on permissions
                this._applyPermissions(permissions);

            } catch (err) {
                console.error(err);
                MessageBox.error("Unauthorized. Please log in again.");
                this.getOwnerComponent().getRouter().navTo("login-admin");
            }
        },

        _applyPermissions: function (permissions) {
            // Super admin: show everything
            const userModel = this.getView().getModel("user");
            const role = userModel && userModel.getProperty("/role");
            if (String(role || "").toLowerCase() === "super_admin") {
                const examSection = this.byId("examSection");
                if (examSection) examSection.setVisible(true);
                const resultsSection = this.byId("resultsSection");
                if (resultsSection) resultsSection.setVisible(true);
                return;
            }

            // permissions may be array of strings or objects with name
            const permNames = permissions
                .map(function (p) { return (typeof p === "string" ? p : p.name) || ""; })
                .map(function (n) { return String(n).toLowerCase(); });

            // Example: if no "manage_exams" permission → hide exam management section
            if (!permNames.includes("manage_exams")) {
                const examSection = this.byId("examSection");
                if (examSection) examSection.setVisible(false);
            }
            if (!permNames.includes("view_results")) {
                const resultsSection = this.byId("resultsSection");
                if (resultsSection) resultsSection.setVisible(false);
            }
        }
        ,

        // === Actions ===
        onOpenCreateExamDialog: function() {
            const user = this.getView().getModel("user") && this.getView().getModel("user").getData();
            if (!user) { MessageBox.error("User not loaded."); return; }
            // Super admin shortcut
            if (String(user.role).toLowerCase() === "super_admin") { this._showCreateExamDialog(); return; }
            const permsModel = this.getView().getModel("permModel");
            const perms = permsModel ? permsModel.getProperty("/permissions") : [];
            const names = (perms || []).map(p => (typeof p === "string" ? p : p.name) || "").map(n => n.toLowerCase());
            if (!names.includes("create_exam") && !names.includes("manage_exams")) {
                MessageBox.error("Access denied. You don't have permission to create exams.");
                return;
            }
            this._showCreateExamDialog();
        },

        _showCreateExamDialog: function() {
            const that = this;
            const dialog = new sap.m.Dialog({
                title: "Create Exam",
                content: [
                    new sap.m.Input("examTitle", { placeholder: "Title" }),
                    new sap.m.Input("examDescription", { placeholder: "Description" }),
                    new sap.m.Input("examDueDate", { placeholder: "Due Date (YYYY-MM-DD)" }),
                    new sap.m.DatePicker("examStartDate", { placeholder: "Start Date" }),
                    new sap.m.DatePicker("examEndDate", { placeholder: "End Date" })
                ],
                beginButton: new sap.m.Button({
                    text: "Create",
                    press: function() {
                        const title = sap.ui.getCore().byId("examTitle").getValue();
                        const description = sap.ui.getCore().byId("examDescription").getValue();
                        const dueDate = sap.ui.getCore().byId("examDueDate").getValue();
                        const user = that.getView().getModel("user").getData();
                        const createdBy = user.id || user.userId;
                        const startDate = sap.ui.getCore().byId("examStartDate").getValue();
                        const endDate = sap.ui.getCore().byId("examEndDate").getValue();
                        ExamService.createExam({ title, description, due_date: dueDate, created_by: createdBy, start_date: startDate, end_date: endDate })
                            .then(() => MessageBox.success("Exam created!"))
                            .catch(err => MessageBox.error("Error: " + (err.message || err)));
                        dialog.close();
                    }
                }),
                endButton: new sap.m.Button({ text: "Cancel", press: function() { dialog.close(); } })
            });
            dialog.open();
        },

        onOpenAddQuestionDialog: function() {
            const user = this.getView().getModel("user") && this.getView().getModel("user").getData();
            if (!user) { MessageBox.error("User not loaded."); return; }
            if (String(user.role).toLowerCase() === "super_admin") { this._showAddQuestionDialog(); return; }
            const permsModel = this.getView().getModel("permModel");
            const perms = permsModel ? permsModel.getProperty("/permissions") : [];
            const names = (perms || []).map(p => (typeof p === "string" ? p : p.name) || "").map(n => n.toLowerCase());
            if (!names.includes("create_questions")) {
                MessageBox.error("Access denied. You don't have permission to create questions.");
                return;
            }
            this._showAddQuestionDialog();
        },

        _showAddQuestionDialog: function() {
            const dialog = new sap.m.Dialog({
                title: "Add Question",
                content: [
                    new sap.m.Input("questionExamId", { placeholder: "Exam ID" }),
                    new sap.m.Input("questionText", { placeholder: "Question Text" }),
                    new sap.m.Input("optionA", { placeholder: "Option A" }),
                    new sap.m.Input("optionB", { placeholder: "Option B" }),
                    new sap.m.Input("optionC", { placeholder: "Option C" }),
                    new sap.m.Input("optionD", { placeholder: "Option D" }),
                    new sap.m.Input("correctOption", { placeholder: "Correct Option (A/B/C/D)" })
                ],
                beginButton: new sap.m.Button({
                    text: "Add",
                    press: function() {
                        const payload = {
                            exam_id: sap.ui.getCore().byId("questionExamId").getValue(),
                            question_text: sap.ui.getCore().byId("questionText").getValue(),
                            option_a: sap.ui.getCore().byId("optionA").getValue(),
                            option_b: sap.ui.getCore().byId("optionB").getValue(),
                            option_c: sap.ui.getCore().byId("optionC").getValue(),
                            option_d: sap.ui.getCore().byId("optionD").getValue(),
                            correct_option: sap.ui.getCore().byId("correctOption").getValue()
                        };
                        ExamService.addQuestion(payload)
                            .then(() => sap.m.MessageBox.success("Question added!"))
                            .catch(err => sap.m.MessageBox.error("Error: " + (err.message || err)));
                        dialog.close();
                    }
                }),
                endButton: new sap.m.Button({ text: "Cancel", press: function() { dialog.close(); } })
            });
            dialog.open();
        },

        onOpenAssignExamDialog: function() {
            const user = this.getView().getModel("user") && this.getView().getModel("user").getData();
            if (!user) { MessageBox.error("User not loaded."); return; }
            if (String(user.role).toLowerCase() === "super_admin") { this._showAssignExamDialog(); return; }
            const permsModel = this.getView().getModel("permModel");
            const perms = permsModel ? permsModel.getProperty("/permissions") : [];
            const names = (perms || []).map(p => (typeof p === "string" ? p : p.name) || "").map(n => n.toLowerCase());
            if (!names.includes("assign_exam")) {
                MessageBox.error("Access denied. You don't have permission to assign exams.");
                return;
            }
            this._showAssignExamDialog();
        },

        _showAssignExamDialog: function() {
            const dialog = new sap.m.Dialog({
                title: "Assign Exam",
                content: [
                    new sap.m.Input("assignExamId", { placeholder: "Exam ID" }),
                    new sap.m.Input("assignUserId", { placeholder: "User ID" }),
                    new sap.m.Input("assignEmail", { placeholder: "Employee Email" })
                ],
                beginButton: new sap.m.Button({
                    text: "Assign",
                    press: function() {
                        const exam_id = sap.ui.getCore().byId("assignExamId").getValue();
                        const user_id = sap.ui.getCore().byId("assignUserId").getValue();
                        const email = sap.ui.getCore().byId("assignEmail").getValue();
                        ExamService.assignExam({ exam_id, user_id, email })
                            .then(() => sap.m.MessageBox.success("Exam assigned!"))
                            .catch(err => sap.m.MessageBox.error(err.error || err.message || "Could not assign exam."));
                        dialog.close();
                    }
                }),
                endButton: new sap.m.Button({ text: "Cancel", press: function() { dialog.close(); } })
            });
            dialog.open();
        },

        onOpenResultsDialog: function() {
            const that = this;
            const examId = prompt("Enter Exam ID to view results:");
            if (!examId) return;
            ExamService.getAllExamResults(examId)
                .then(function (data) {
                    const text = (data || []).map(function (r) { return r.name + ": " + r.score + "/" + r.total; }).join("\n");
                    sap.m.MessageBox.information(text || "No results yet.");
                })
                .catch(function (err) { sap.m.MessageBox.error("Failed to load results: " + (err.message || err)); });
        }
    });
});



