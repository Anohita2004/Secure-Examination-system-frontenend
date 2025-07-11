/*sap.ui.define([
  "./BaseController",
  "sap/m/MessageBox",
  "exam/model/ExamService",
  "exam/model/AuthService"
], function (BaseController, MessageBox, ExamService, AuthService) {
  "use strict";

  let countdownInterval;

  return BaseController.extend("exam.controller.Exam", {
    onInit: function () {
      console.log("Exam controller onInit");
      var that = this;
      AuthService.getCurrentUser()
        .then(function(user) {
          that.getView().setModel(new sap.ui.model.json.JSONModel(user), "user");
          that._setupExamRoute();
        })
        .catch(function(err) {
          MessageBox.error("Unauthorized access.");
          that.getRouter().navTo("login-employee");
        });
    },

    _setupExamRoute: function() {
      const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.getRoute("exam").attachPatternMatched(this._onRouteMatched, this);
    },

    _onRouteMatched: function (oEvent) {
      const examId = oEvent.getParameter("arguments").examId;
      console.log("Route matched", examId);
      var that = this;
      ExamService.getExamQuestions(examId)
        .then(data => {
          if (!Array.isArray(data) || data.length === 0) {
            MessageBox.warning("No questions found.");
            // Set an empty model to prevent undefined errors
            that.getView().setModel(new sap.ui.model.json.JSONModel({
              questions: [],
              currentIndex: 0,
              timeLeft: 900
            }), "questions");
            return;
          }
          // Add status, selectedIndex, and index to each question
          data.forEach((q, index) => {
            q.selectedIndex = -1;
            q.status = "notAnswered";
            q.index = index;
          });
          // Model structure: { questions: [...], currentIndex: 0, timeLeft: 900 }
          const model = new sap.ui.model.json.JSONModel({
            questions: data,
            currentIndex: 0,
            timeLeft: 900 // 15 minutes
          });
          that.getView().setModel(model, "questions");
          that._startCountdown();
        })
        .catch(err => {
          MessageBox.error("Failed to load exam.");
          // Set an empty model to prevent undefined errors
          that.getView().setModel(new sap.ui.model.json.JSONModel({
            questions: [],
            currentIndex: 0,
            timeLeft: 900
          }), "questions");
        });
    },

    _startCountdown: function () {
      var that = this;
      var model = this.getView().getModel("questions");
      if (!model) return;
      countdownInterval = setInterval(function() {
        var timeLeft = model.getProperty("/timeLeft");
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          MessageBox.warning("Time is up! Auto-submitting exam.");
          that.onSubmitExam(true);
        } else {
          model.setProperty("/timeLeft", timeLeft - 1);
        }
      }, 1000);
    },

    onSelectAnswer: function (oEvent) {
      var model = this.getView().getModel("questions");
      if (!model) {
        sap.m.MessageBox.error("Questions not loaded yet. Please wait.");
        return;
      }
      var currentIndex = model.getProperty("/currentIndex");
      var questions = model.getProperty("/questions");
      if (!questions || !questions[currentIndex]) {
        sap.m.MessageBox.error("Invalid question selection.");
        return;
      }
      questions[currentIndex].selectedIndex = oEvent.getParameter("selectedIndex");
      questions[currentIndex].status = "answered";
      model.setProperty("/questions", questions);
    },

    onSaveNext: function () {
      var model = this.getView().getModel("questions");
      if (!model) {
        sap.m.MessageBox.error("Questions not loaded yet. Please wait.");
        return;
      }
      var currentIndex = model.getProperty("/currentIndex");
      var questions = model.getProperty("/questions");
      if (!questions || !questions[currentIndex]) {
        sap.m.MessageBox.error("Invalid question selection.");
        return;
      }
      // If answered, set status
      if (questions[currentIndex].selectedIndex !== -1) {
        questions[currentIndex].status = "answered";
      }
      // Move to next question if possible
      if (currentIndex < questions.length - 1) {
        model.setProperty("/currentIndex", currentIndex + 1);
      }
      model.setProperty("/questions", questions);
    },

    onMarkForReview: function () {
      var model = this.getView().getModel("questions");
      if (!model) {
        sap.m.MessageBox.error("Questions not loaded yet. Please wait.");
        return;
      }
      var currentIndex = model.getProperty("/currentIndex");
      var questions = model.getProperty("/questions");
      if (!questions || !questions[currentIndex]) {
        sap.m.MessageBox.error("Invalid question selection.");
        return;
      }
      questions[currentIndex].status = "markedForReview";
      // Move to next question if possible
      if (currentIndex < questions.length - 1) {
        model.setProperty("/currentIndex", currentIndex + 1);
      }
      model.setProperty("/questions", questions);
    },

    onClearAnswer: function () {
      var model = this.getView().getModel("questions");
      if (!model) {
        sap.m.MessageBox.error("Questions not loaded yet. Please wait.");
        return;
      }
      var currentIndex = model.getProperty("/currentIndex");
      var questions = model.getProperty("/questions");
      if (!questions || !questions[currentIndex]) {
        sap.m.MessageBox.error("Invalid question selection.");
        return;
      }
      questions[currentIndex].selectedIndex = -1;
      questions[currentIndex].status = "notAnswered";
      model.setProperty("/questions", questions);
    },

    onNavigateToQuestion: function (oEvent) {
      var model = this.getView().getModel("questions");
      if (!model) {
        sap.m.MessageBox.error("Questions not loaded yet. Please wait.");
        return;
      }
      var index = oEvent.getSource().data("questionIndex");
      var questions = model.getProperty("/questions");
      if (!questions || !questions[index]) {
        sap.m.MessageBox.error("Invalid question selection.");
        return;
      }
      model.setProperty("/currentIndex", index);
    },

    onSubmitExam: function (isAutoSubmit = false) {
      clearInterval(countdownInterval);
      var model = this.getView().getModel("questions");
      if (!model) {
        sap.m.MessageBox.error("Questions not loaded yet. Please wait.");
        return;
      }
      var questions = model.getProperty("/questions");
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        sap.m.MessageBox.error("No questions to submit.");
        return;
      }
      var answers = questions.map(q => {
        let answer = null;
        if (q.selectedIndex === 0) answer = "A";
        if (q.selectedIndex === 1) answer = "B";
        if (q.selectedIndex === 2) answer = "C";
        if (q.selectedIndex === 3) answer = "D";
        return { question_id: q.id, answer };
      });
      const examId = this._getExamIdFromRoute();
      const user = this.getView().getModel("user").getData();
      const userId = user.id;
      ExamService.submitExamAnswers(examId, userId, answers)
        .then(() => {
          MessageBox.success(isAutoSubmit ? "Exam auto-submitted." : "Exam submitted successfully.");
          setTimeout(() => {
            this.getRouter().navTo("employee-dashboard");
          }, 1000);
        })
        .catch(err => {
          MessageBox.error("Failed to submit exam: " + err.message);
        });
    },

    _getExamIdFromRoute: function () {
      const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      const oHash = oRouter.getHashChanger().getHash();
      return oHash.split("/")[1];
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

  let countdownInterval;

  return BaseController.extend("exam.controller.Exam", {
    onInit: function () {
      console.log("Exam controller onInit");
      const that = this;

      AuthService.getCurrentUser()
        .then(user => {
          that.getView().setModel(new sap.ui.model.json.JSONModel(user), "user");
          that._setupExamRoute();
        })
        .catch(() => {
          MessageBox.error("Unauthorized access.");
          that.getRouter().navTo("login-employee");
        });
    },

    _setupExamRoute: function () {
      const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.getRoute("exam").attachPatternMatched(this._onRouteMatched, this);
    },

    _onRouteMatched: function (oEvent) {
      const examId = oEvent.getParameter("arguments").examId;
      const that = this;

      ExamService.getExamQuestions(examId)
        .then(data => {
          if (!Array.isArray(data) || data.length === 0) {
            MessageBox.warning("No questions found.");
            that._initEmptyModel();
            return;
          }

          data.forEach((q, index) => {
            q.index = index;
            q.selectedIndex = -1;
            q.status = "notAnswered";
          });

          const model = new sap.ui.model.json.JSONModel({
            questions: data,
            currentIndex: 0,
            currentQuestion: data[0],
            timeLeft: 900
          });

          // Automatically update currentQuestion when currentIndex changes
          model.attachPropertyChange(function (e) {
            if (e.getParameter("path") === "/currentIndex") {
              const index = e.getParameter("value");
              const all = model.getProperty("/questions");
              model.setProperty("/currentQuestion", all[index]);
            }
          });

          that.getView().setModel(model, "questions");
          that._startCountdown();
        })
        .catch(err => {
          MessageBox.error("Failed to load exam.");
          that._initEmptyModel();
        });
    },

    _initEmptyModel: function () {
      this.getView().setModel(new sap.ui.model.json.JSONModel({
        questions: [],
        currentIndex: 0,
        currentQuestion: {},
        timeLeft: 900
      }), "questions");
    },

    _startCountdown: function () {
      const that = this;
      const model = this.getView().getModel("questions");
      if (!model) return;

      countdownInterval = setInterval(() => {
        const timeLeft = model.getProperty("/timeLeft");
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          MessageBox.warning("Time is up! Auto-submitting exam.");
          that.onSubmitExam(true);
        } else {
          model.setProperty("/timeLeft", timeLeft - 1);
        }
      }, 1000);
    },

    onSelectAnswer: function (oEvent) {
      const model = this.getView().getModel("questions");
      const selectedIndex = oEvent.getParameter("selectedIndex");
      const index = model.getProperty("/currentIndex");

      model.setProperty(`/questions/${index}/selectedIndex`, selectedIndex);
      model.setProperty(`/questions/${index}/status`, "answered");
      model.setProperty("/currentQuestion/selectedIndex", selectedIndex);
      model.setProperty("/currentQuestion/status", "answered");
    },

    onSaveNext: function () {
  const model = this.getView().getModel("questions");
  let index = model.getProperty("/currentIndex");
  const questions = model.getProperty("/questions");

  if (questions[index].selectedIndex !== -1) {
    questions[index].status = "answered";
  }

  // Update full questions array to trigger UI refresh
  model.setProperty("/questions", questions);

  if (index < questions.length - 1) {
    index += 1;
    model.setProperty("/currentIndex", index);
    model.setProperty("/currentQuestion", questions[index]); // 💥 Force update
  }
},


    onMarkForReview: function () {
  const model = this.getView().getModel("questions");
  let index = model.getProperty("/currentIndex");
  const questions = model.getProperty("/questions");

  questions[index].status = "markedForReview";
  model.setProperty("/questions", questions); // ✅ force update

  if (index < questions.length - 1) {
    index += 1;
    model.setProperty("/currentIndex", index);
    model.setProperty("/currentQuestion", questions[index]); // 💥 Force update
  }
},


    onClearAnswer: function () {
      const model = this.getView().getModel("questions");
      const index = model.getProperty("/currentIndex");

      model.setProperty(`/questions/${index}/selectedIndex`, -1);
      model.setProperty(`/questions/${index}/status`, "notAnswered");
      model.setProperty("/currentQuestion/selectedIndex", -1);
      model.setProperty("/currentQuestion/status", "notAnswered");
    },

    onNavigateToQuestion: function (oEvent) {
  const index = oEvent.getSource().data("questionIndex");
  const model = this.getView().getModel("questions");
  const questions = model.getProperty("/questions");

  model.setProperty("/currentIndex", index);
  model.setProperty("/currentQuestion", questions[index]); // 💥 Force refresh
}
,

    onSubmitExam: function (isAutoSubmit = false) {
      clearInterval(countdownInterval);
      const model = this.getView().getModel("questions");
      const questions = model.getProperty("/questions");

      if (!Array.isArray(questions) || questions.length === 0) {
        MessageBox.error("No questions to submit.");
        return;
      }

      const answers = questions.map(q => {
        let answer = null;
        if (q.selectedIndex === 0) answer = "A";
        if (q.selectedIndex === 1) answer = "B";
        if (q.selectedIndex === 2) answer = "C";
        if (q.selectedIndex === 3) answer = "D";
        return { question_id: q.id, answer };
      });

      const examId = this._getExamIdFromRoute();
      const user = this.getView().getModel("user").getData();
      const userId = user.id;

      ExamService.submitExamAnswers(examId, userId, answers)
        .then(() => {
          MessageBox.success(isAutoSubmit ? "Exam auto-submitted." : "Exam submitted successfully.");
          setTimeout(() => {
            this.getRouter().navTo("employee-dashboard");
          }, 1000);
        })
        .catch(err => {
          MessageBox.error("Failed to submit exam: " + err.message);
        });
    },

    _getExamIdFromRoute: function () {
      const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      const oHash = oRouter.getHashChanger().getHash();
      return oHash.split("/")[1];
    }
  });
});
