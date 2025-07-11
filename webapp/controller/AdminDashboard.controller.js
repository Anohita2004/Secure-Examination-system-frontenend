/*sap.ui.define([
  "./BaseController",
  "sap/m/MessageBox",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/m/Input",
  "sap/ui/model/json/JSONModel",
  "exam/model/ExamService"
], function(BaseController, MessageBox, Dialog, Button, Input,JSONModel,ExamService) {
  "use strict";
  return BaseController.extend("exam.controller.AdminDashboard", {
    onInit: function () {
  var that = this;
  fetch("http://localhost:4000/api/dashboard/stats")
    .then(res => res.json())
    .then(data => {
      var oModel = new sap.ui.model.json.JSONModel(data);
      that.getView().setModel(oModel, "dashboardModel");
    })
    .catch(err => console.error("Failed to load dashboard stats", err));
   fetch("http://localhost:4000/api/users")
    .then(res => res.json())
    .then(data => {
      var userModel = new sap.ui.model.json.JSONModel(data);
      this.getView().setModel(userModel, "users");
    })
    .catch(err => console.error("Error loading users", err)); 
  var oTableModel = new JSONModel();
  this.getView().setModel(oTableModel, "tableModel");
  var oTableModel = new JSONModel();
  this.getView().setModel(oTableModel, "tableModel");

  fetch("http://localhost:4000/api/dashboard/table")
    .then(res => res.json())
    .then(data => {
      oTableModel.setData(data);
    })
    .catch(err => {
      console.error("Failed to load table data", err);
    });

  
},

    onOpenCreateExamDialog: function() {
      var dialog = new Dialog({
        title: "Create Exam",
        content: [
          new Input("examTitle", { placeholder: "Title" }),
          new Input("examDescription", { placeholder: "Description" }),
          new Input("examDueDate", { placeholder: "Due Date (YYYY-MM-DD)" })
        ],
        beginButton: new Button({
          text: "Create",
          press: function() {
            var title = sap.ui.getCore().byId("examTitle").getValue();
            var description = sap.ui.getCore().byId("examDescription").getValue();
            var dueDate = sap.ui.getCore().byId("examDueDate").getValue();
            var createdBy = localStorage.getItem("userId");
            ExamService.createExam({ title, description, due_date: dueDate, created_by: createdBy })
              .then(data => MessageBox.success("Exam created!"))
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
      var dialog = new Dialog({
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
            var exam_id = sap.ui.getCore().byId("questionExamId").getValue();
            var question_text = sap.ui.getCore().byId("questionText").getValue();
            var option_a = sap.ui.getCore().byId("optionA").getValue();
            var option_b = sap.ui.getCore().byId("optionB").getValue();
            var option_c = sap.ui.getCore().byId("optionC").getValue();
            var option_d = sap.ui.getCore().byId("optionD").getValue();
            var correct_option = sap.ui.getCore().byId("correctOption").getValue();
            ExamService.addQuestion({ exam_id, question_text, option_a, option_b, option_c, option_d, correct_option })
              .then(data => MessageBox.success("Question added!"))
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
      var dialog = new Dialog({
        title: "Assign Exam",
        content: [
          new Input("assignExamId", { placeholder: "Exam ID" }),
          new Input("assignUserId", { placeholder: "User ID" }),
          new Input("assignEmail", { placeholder: "Employee Email" })
        ],
        beginButton: new Button({
          text: "Assign",
          press: function() {
            var exam_id = sap.ui.getCore().byId("assignExamId").getValue();
            var user_id = sap.ui.getCore().byId("assignUserId").getValue();
            var email = sap.ui.getCore().byId("assignEmail").getValue();
            ExamService.assignExam({ exam_id, user_id, email })
              .then(data => MessageBox.success("Exam assigned!"))
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
    onOpenResultsDialog: function() {
  var examId = prompt("Enter Exam ID to view results:");
  if (!examId) return;
  ExamService.getAllExamResults(examId)
    .then(data => {
      var resultsText = data.map(r => r.name + ": " + r.score + "/" + r.total).join("\n");
      sap.m.MessageBox.information(resultsText || "No results yet.");
    })
    .catch(err => sap.m.MessageBox.error("Failed to load results: " + err.message));
}
  });
});*/
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
  return BaseController.extend("exam.controller.AdminDashboard", {
    onInit: function () {
      var that = this;
  AuthService.getCurrentUser()
    .then(function(user) {
      var userModel = new sap.ui.model.json.JSONModel(user);
      that.getView().setModel(userModel, "user");

      // Set default model for dashboard data
      var oModel = new sap.ui.model.json.JSONModel({});
      that.getView().setModel(oModel);

      return that.loadPermissionsAndSetupUI(user);
    })
    .catch(function(err) {
      MessageBox.error("Authentication failed: " + err.message);
      that.getRouter().navTo("main");
    });
    },

    loadPermissionsAndSetupUI: function(user) {
      var that = this;
      
      // Load user permissions
      return PermissionChecker.hasPermission(user.id, 'view_dashboard')
        .then(function(hasDashboardAccess) {
          if (!hasDashboardAccess) {
            MessageBox.error("Access denied. You don't have permission to view the dashboard.");
            that.getRouter().navTo("main");
            return;
          }
          
          // Load dashboard data
          return that.loadDashboardData();
        });
    },

    loadDashboardData: function() {
      var that = this;
      
      // Load dashboard stats
      fetch("http://localhost:4000/api/dashboard/stats", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          var oModel = new sap.ui.model.json.JSONModel(data);
          that.getView().setModel(oModel, "dashboardModel");
        })
        .catch(err => console.error("Failed to load dashboard stats", err));
      
      // Load users
      fetch("http://localhost:4000/api/users", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          var userModel = new sap.ui.model.json.JSONModel(data);
          that.getView().setModel(userModel, "users");
        })
        .catch(err => console.error("Error loading users", err));
      
      // Load table data
      var oTableModel = new JSONModel();
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
      var that = this;
      var user = this.getView().getModel("user").getData();
      
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
      var that = this;
      var dialog = new Dialog({
        title: "Create Exam",
        content: [
          new Input("examTitle", { placeholder: "Title" }),
          new Input("examDescription", { placeholder: "Description" }),
          new Input("examDueDate", { placeholder: "Due Date (YYYY-MM-DD)" })
        ],
        beginButton: new Button({
          text: "Create",
          press: function() {
            var title = sap.ui.getCore().byId("examTitle").getValue();
            var description = sap.ui.getCore().byId("examDescription").getValue();
            var dueDate = sap.ui.getCore().byId("examDueDate").getValue();
            var user = that.getView().getModel("user").getData();
            var createdBy = user.id;
            ExamService.createExam({ title, description, due_date: dueDate, created_by: createdBy })
              .then(data => MessageBox.success("Exam created!"))
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
      var that = this;
      var user = this.getView().getModel("user").getData();
      
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
      var dialog = new Dialog({
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
            var exam_id = sap.ui.getCore().byId("questionExamId").getValue();
            var question_text = sap.ui.getCore().byId("questionText").getValue();
            var option_a = sap.ui.getCore().byId("optionA").getValue();
            var option_b = sap.ui.getCore().byId("optionB").getValue();
            var option_c = sap.ui.getCore().byId("optionC").getValue();
            var option_d = sap.ui.getCore().byId("optionD").getValue();
            var correct_option = sap.ui.getCore().byId("correctOption").getValue();
            ExamService.addQuestion({ exam_id, question_text, option_a, option_b, option_c, option_d, correct_option })
              .then(data => MessageBox.success("Question added!"))
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
      var that = this;
      var user = this.getView().getModel("user").getData();
      
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
      var dialog = new Dialog({
        title: "Assign Exam",
        content: [
          new Input("assignExamId", { placeholder: "Exam ID" }),
          new Input("assignUserId", { placeholder: "User ID" }),
          new Input("assignEmail", { placeholder: "Employee Email" })
        ],
        beginButton: new Button({
          text: "Assign",
          press: function() {
            var exam_id = sap.ui.getCore().byId("assignExamId").getValue();
            var user_id = sap.ui.getCore().byId("assignUserId").getValue();
            var email = sap.ui.getCore().byId("assignEmail").getValue();
            ExamService.assignExam({ exam_id, user_id, email })
              .then(data => MessageBox.success("Exam assigned!"))
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

    onOpenResultsDialog: function() {
      var that = this;
      var user = this.getView().getModel("user").getData();
      
      PermissionChecker.hasPermission(user.id, 'view_results')
        .then(function(hasPermission) {
          if (!hasPermission) {
            MessageBox.error("Access denied. You don't have permission to view results.");
            return;
          }
          
          var examId = prompt("Enter Exam ID to view results:");
          if (!examId) return;
          ExamService.getAllExamResults(examId)
            .then(data => {
              var resultsText = data.map(r => r.name + ": " + r.score + "/" + r.total).join("\n");
              sap.m.MessageBox.information(resultsText || "No results yet.");
            })
            .catch(err => sap.m.MessageBox.error("Failed to load results: " + err.message));
        });
    }
  });
});*/
sap.ui.define([
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

  // Helper function to check if user is super admin
  function isSuperAdmin(user) {
    return user && user.role === "super_admin";
  }

  return BaseController.extend("exam.controller.AdminDashboard", {
    onInit: function () {
      console.log("AdminDashboard onInit called");
      var that = this;
      AuthService.getCurrentUser()
        .then(function(user) {
          var userModel = new sap.ui.model.json.JSONModel(user);
          that.getView().setModel(userModel, "user");

          // Set default model for dashboard data
          var oModel = new sap.ui.model.json.JSONModel({});
          that.getView().setModel(oModel);

          return that.loadPermissionsAndSetupUI(user);
        })
        .catch(function(err) {
          MessageBox.error("Authentication failed: " + err.message);
          that.getRouter().navTo("main");
        });
    },

    loadPermissionsAndSetupUI: function(user) {
      var that = this;
      if (isSuperAdmin(user)) {
        // Super admin always has access
        return that.loadDashboardData();
      }
      // Load user permissions
      return PermissionChecker.hasPermission(user.id, 'view_dashboard')
        .then(function(hasDashboardAccess) {
          if (!hasDashboardAccess) {
            MessageBox.error("Access denied. You don't have permission to view the dashboard.");
            that.getRouter().navTo("main");
            return;
          }
          // Load dashboard data
          return that.loadDashboardData();
        });
    },

    loadDashboardData: function() {
      var that = this;
      // Load dashboard stats
      fetch("http://localhost:4000/api/dashboard/stats", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          var oModel = new sap.ui.model.json.JSONModel(data);
          that.getView().setModel(oModel, "dashboardModel");
        })
        .catch(err => console.error("Failed to load dashboard stats", err));
      // Load users
     /* fetch("http://localhost:4000/api/users", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          var userModel = new sap.ui.model.json.JSONModel(data);
          that.getView().setModel(userModel, "users");
        })
        .catch(err => console.error("Error loading users", err));*/
        
      // Load table data
      var oTableModel = new JSONModel();
      that.getView().setModel(oTableModel, "tableModel");
      
      console.log("🔍 Loading table data from /api/dashboard/table...");
      fetch("http://localhost:4000/api/dashboard/table", { credentials: "include" })
        .then(res => {
          console.log("📡 Response status:", res.status);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          console.log("📊 Table data received:", data);
          oTableModel.setData(data);
        })
        .catch(err => {
          console.error("❌ Failed to load table data:", err);
          // Show error to user
          sap.m.MessageBox.error("Failed to load table data: " + err.message);
          
          // TEMPORARY: Add mock data for testing
          console.log("🔄 Loading mock data for testing...");
          var mockData = [
            {
              name: "John Doe",
              email: "john.doe@company.com",
              role: "employee",
              title: "JavaScript Basics",
              attempted: "Yes"
            },
            {
              name: "Jane Smith",
              email: "jane.smith@company.com", 
              role: "employee",
              title: "Python Fundamentals",
              attempted: "No"
            },
            {
              name: "Bob Johnson",
              email: "bob.johnson@company.com",
              role: "admin",
              title: "Database Design",
              attempted: "Yes"
            }
          ];
          oTableModel.setData(mockData);
          console.log("✅ Mock data loaded:", mockData);
        });
    },

    onOpenCreateExamDialog: function() {
      var that = this;
      var user = this.getView().getModel("user").getData();
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
      var that = this;
      var dialog = new Dialog({
        title: "Create Exam",
        content: [
          new Input("examTitle", { placeholder: "Title" }),
          new Input("examDescription", { placeholder: "Description" }),
          new Input("examDueDate", { placeholder: "Due Date (YYYY-MM-DD)" })
        ],
        beginButton: new Button({
          text: "Create",
          press: function() {
            var title = sap.ui.getCore().byId("examTitle").getValue();
            var description = sap.ui.getCore().byId("examDescription").getValue();
            var dueDate = sap.ui.getCore().byId("examDueDate").getValue();
            var user = that.getView().getModel("user").getData();
            var createdBy = user.id;
            ExamService.createExam({ title, description, due_date: dueDate, created_by: createdBy })
              .then(data => MessageBox.success("Exam created!"))
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
      var that = this;
      var user = this.getView().getModel("user").getData();
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
  var dialog = new sap.m.Dialog({
    title: "Add Question",
    content: [
      new sap.m.Input("questionExamId", { placeholder: "Exam ID" }),
      new sap.m.Input("questionText", { placeholder: "Question Text" }),
      new sap.m.Input("optionA", { placeholder: "Option A" }),
      new sap.m.Input("optionB", { placeholder: "Option B" }),
      new sap.m.Input("optionC", { placeholder: "Option C" }),
      new sap.m.Input("optionD", { placeholder: "Option D" }),
      new sap.m.CheckBox("isMSQ", { text: "Multiple Select (MSQ)", select: function(e) {
        // Show/hide correct option fields based on MSQ/MCQ
        var isMSQ = e.getSource().getSelected();
        sap.ui.getCore().byId("mcqCorrectOption").setVisible(!isMSQ);
        sap.ui.getCore().byId("msqCorrectOptionsBox").setVisible(isMSQ);
      }}),
      // MCQ correct option (single input)
      new sap.m.Input("mcqCorrectOption", { placeholder: "Correct Option (A/B/C/D)" }),
      // MSQ correct options (checkboxes)
      new sap.m.HBox("msqCorrectOptionsBox", {
        visible: false,
        items: [
          new sap.m.CheckBox("correctA", { text: "A" }),
          new sap.m.CheckBox("correctB", { text: "B" }),
          new sap.m.CheckBox("correctC", { text: "C" }),
          new sap.m.CheckBox("correctD", { text: "D" })
        ]
      })
    ],
    beginButton: new sap.m.Button({
      text: "Add",
      press: function() {
        var exam_id = sap.ui.getCore().byId("questionExamId").getValue();
        var question_text = sap.ui.getCore().byId("questionText").getValue();
        var option_a = sap.ui.getCore().byId("optionA").getValue();
        var option_b = sap.ui.getCore().byId("optionB").getValue();
        var option_c = sap.ui.getCore().byId("optionC").getValue();
        var option_d = sap.ui.getCore().byId("optionD").getValue();
        var is_msq = sap.ui.getCore().byId("isMSQ").getSelected();

        var correct_option;
        if (is_msq) {
          // Collect all checked options for MSQ
          var corrects = [];
          if (sap.ui.getCore().byId("correctA").getSelected()) corrects.push("A");
          if (sap.ui.getCore().byId("correctB").getSelected()) corrects.push("B");
          if (sap.ui.getCore().byId("correctC").getSelected()) corrects.push("C");
          if (sap.ui.getCore().byId("correctD").getSelected()) corrects.push("D");
          correct_option = corrects.join(",");
        } else {
          correct_option = sap.ui.getCore().byId("mcqCorrectOption").getValue();
        }

        // Validation (optional)
        if (!exam_id || !question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
          sap.m.MessageBox.error("Please fill all fields and select at least one correct option.");
          return;
        }

        // Call your ExamService
        ExamService.addQuestion({
          exam_id,
          question_text,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_option,
          is_msq
        })
        .then(data => sap.m.MessageBox.success("Question added!"))
        .catch(err => sap.m.MessageBox.error("Error: " + err.message));
        dialog.close();
      }
    }),
    endButton: new sap.m.Button({
      text: "Cancel",
      press: function() { dialog.close(); }
    })
  });
  dialog.open();
},

    onOpenAssignExamDialog: function() {
      var that = this;
      var user = this.getView().getModel("user").getData();
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
      var dialog = new Dialog({
        title: "Assign Exam",
        content: [
          new Input("assignExamId", { placeholder: "Exam ID" }),
          new Input("assignUserId", { placeholder: "User ID" }),
          new Input("assignEmail", { placeholder: "Employee Email" })
        ],
        beginButton: new Button({
          text: "Assign",
          press: function() {
            var exam_id = sap.ui.getCore().byId("assignExamId").getValue();
            var user_id = sap.ui.getCore().byId("assignUserId").getValue();
            var email = sap.ui.getCore().byId("assignEmail").getValue();
            ExamService.assignExam({ exam_id, user_id, email })
              .then(data => MessageBox.success("Exam assigned!"))
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

    onOpenResultsDialog: function() {
      var that = this;
      var user = this.getView().getModel("user").getData();
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
      var that = this;
      var examId = prompt("Enter Exam ID to view results:");
      if (!examId) return;
      ExamService.getAllExamResults(examId)
        .then(data => {
          var resultsText = data.map(r => r.name + ": " + r.score + "/" + r.total).join("\n");
          sap.m.MessageBox.information(resultsText || "No results yet.");
        })
        .catch(err => sap.m.MessageBox.error("Failed to load results: " + err.message));
    },

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
});