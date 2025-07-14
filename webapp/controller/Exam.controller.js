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
      // Attach the route handler immediately!
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.getRoute("exam").attachPatternMatched(this._onRouteMatched, this);

      // Secure Exam: Add event listeners
      this._onFullscreenChangeBound = this._onFullscreenChange.bind(this);
      document.addEventListener("fullscreenchange", this._onFullscreenChangeBound);
      document.addEventListener("webkitfullscreenchange", this._onFullscreenChangeBound);
      document.addEventListener("mozfullscreenchange", this._onFullscreenChangeBound);
      document.addEventListener("MSFullscreenChange", this._onFullscreenChangeBound);
      this._onContextMenuBound = function(e) { e.preventDefault(); };
      document.addEventListener("contextmenu", this._onContextMenuBound);

      // Set an empty model immediately to prevent empty bindings
      this.getView().setModel(new sap.ui.model.json.JSONModel({
        questions: [],
        currentIndex: 0,
        currentQuestion: {},
        timeLeft: 900
      }), "questions");

      // Check authentication (async, but do NOT attach route handler here)
      AuthService.getCurrentUser()
        .then(user => {
          this.getView().setModel(new sap.ui.model.json.JSONModel(user), "user");
        })
        .catch(() => {
          MessageBox.error("Unauthorized access.");
          this.getRouter().navTo("login-employee");
        });
    },

    onExit: function() {
      // Remove event listeners
      document.removeEventListener("fullscreenchange", this._onFullscreenChangeBound);
      document.removeEventListener("webkitfullscreenchange", this._onFullscreenChangeBound);
      document.removeEventListener("mozfullscreenchange", this._onFullscreenChangeBound);
      document.removeEventListener("MSFullscreenChange", this._onFullscreenChangeBound);
      document.removeEventListener("contextmenu", this._onContextMenuBound);
    },

    _requestFullscreen: function() {
      var elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { // Chrome, Safari and Opera
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { // IE/Edge
        elem.msRequestFullscreen();
      }
    },

    _onFullscreenChange: function() {
      // If not in fullscreen, auto-submit
      if (
        !document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.mozFullScreenElement &&
        !document.msFullscreenElement
      ) {
        sap.m.MessageBox.warning("You exited fullscreen. The exam will be auto-submitted.");
        this.onSubmitExam(true);
      }
    },

    _onRouteMatched: function (oEvent) {
      // Reset model to empty
      this.getView().setModel(new sap.ui.model.json.JSONModel({
        questions: [],
        currentIndex: 0,
        currentQuestion: {},
        timeLeft: 900
      }), "questions");

      const examId = oEvent.getParameter("arguments").examId;
      const that = this;

      ExamService.getExamQuestions(examId)
        .then(data => {
          console.log("Backend response:", data); // Debug log
          if (!Array.isArray(data) || data.length === 0) {
            MessageBox.warning("No questions found.");
            that._initEmptyModel();
            return;
          }

          data.forEach((q, index) => {
            q.index = index;
            q.status = "notAnswered";
            // Normalize is_msq to boolean
            q.is_msq = q.is_msq === true || q.is_msq === 1 || q.is_msq === "1" || q.is_msq === "true";
            if (q.is_msq) {
              q.selectedIndices = [];
              q.selectedIndex = -1;
            } else {
              q.selectedIndex = -1;
              q.selectedIndices = [];
            }
          });

          console.log("Processed questions:", data); // Debug log

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

          // --- Secure Exam: Request fullscreen after questions are loaded ---
          that._requestFullscreen();
        })
        .catch(err => {
          console.error("Error loading questions:", err); // Debug log
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

    onSelectMSQOption: function (oEvent) {
      const model = this.getView().getModel("questions");
      const index = model.getProperty("/currentIndex");
      const key = parseInt(oEvent.getSource().data("key"), 10);
      const isSelected = oEvent.getParameter("selected");

      let selectedIndices = model.getProperty(`/questions/${index}/selectedIndices`) || [];

      // Always create a new array to trigger UI update
      if (isSelected) {
        if (!selectedIndices.includes(key)) {
          selectedIndices = selectedIndices.concat([key]);
        }
      } else {
        selectedIndices = selectedIndices.filter(i => i !== key);
      }

      model.setProperty(`/questions/${index}/selectedIndices`, selectedIndices);
      model.setProperty("/currentQuestion/selectedIndices", selectedIndices);

      // Update status
      const status = selectedIndices.length > 0 ? "answered" : "notAnswered";
      model.setProperty(`/questions/${index}/status`, status);
      model.setProperty("/currentQuestion/status", status);
      console.log("Selected indices for question", index, selectedIndices);
    },

    onSaveNext: function () {
      const model = this.getView().getModel("questions");
      let index = model.getProperty("/currentIndex");
      const questions = model.getProperty("/questions");

      // Check if current question is answered (for both MCQ and MSQ)
      const currentQuestion = questions[index];
      const isAnswered = currentQuestion.is_msq ? 
        (currentQuestion.selectedIndices && currentQuestion.selectedIndices.length > 0) :
        (currentQuestion.selectedIndex !== -1);

      if (isAnswered) {
        questions[index].status = "answered";
      }

      // Update full questions array to trigger UI refresh
      model.setProperty("/questions", questions);

      if (index < questions.length - 1) {
        index += 1;
        model.setProperty("/currentIndex", index);
        model.setProperty("/currentQuestion", questions[index]);
      }
    },

    onMarkForReview: function () {
      const model = this.getView().getModel("questions");
      let index = model.getProperty("/currentIndex");
      const questions = model.getProperty("/questions");

      questions[index].status = "markedForReview";
      model.setProperty("/questions", questions);

      if (index < questions.length - 1) {
        index += 1;
        model.setProperty("/currentIndex", index);
        model.setProperty("/currentQuestion", questions[index]);
      }
    },

    onClearAnswer: function () {
      const model = this.getView().getModel("questions");
      const index = model.getProperty("/currentIndex");
      const currentQuestion = model.getProperty("/currentQuestion");

      if (currentQuestion.is_msq) {
        model.setProperty(`/questions/${index}/selectedIndices`, []);
        model.setProperty("/currentQuestion/selectedIndices", []);
      } else {
        model.setProperty(`/questions/${index}/selectedIndex`, -1);
        model.setProperty("/currentQuestion/selectedIndex", -1);
      }
      
      model.setProperty(`/questions/${index}/status`, "notAnswered");
      model.setProperty("/currentQuestion/status", "notAnswered");
    },

    onNavigateToQuestion: function (oEvent) {
      const index = oEvent.getSource().data("questionIndex");
      const model = this.getView().getModel("questions");
      const questions = model.getProperty("/questions");

      model.setProperty("/currentIndex", index);
      model.setProperty("/currentQuestion", questions[index]);
    },

    onSubmitExam: function (isAutoSubmit = false) {
      clearInterval(countdownInterval);
      const model = this.getView().getModel("questions");
      const questions = model.getProperty("/questions");

      if (!Array.isArray(questions) || questions.length === 0) {
        MessageBox.error("No questions to submit.");
        return;
      }

      const answers = questions.map(q => {
        if (q.is_msq) {
          // For MSQ: convert selected indices to option letters (A, B, C, D)
          const optionMap = ["A", "B", "C", "D"];
          const selected = (q.selectedIndices || []).map(i => optionMap[i]);
          return { question_id: q.id, answer: selected }; // answer is an array
        } else {
          // For MCQ: convert selected index to option letter
          let answer = null;
          if (q.selectedIndex === 0) answer = "A";
          if (q.selectedIndex === 1) answer = "B";
          if (q.selectedIndex === 2) answer = "C";
          if (q.selectedIndex === 3) answer = "D";
          return { question_id: q.id, answer };
        }
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
    },

    onPreviousQuestion: function () {
      const model = this.getView().getModel("questions");
      let index = model.getProperty("/currentIndex");
      const questions = model.getProperty("/questions");

      if (index > 0) {
        index -= 1;
        model.setProperty("/currentIndex", index);
        model.setProperty("/currentQuestion", questions[index]);
      }
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
      // Attach the route handler immediately!
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.getRoute("exam").attachPatternMatched(this._onRouteMatched, this);

      // Secure Exam: Add event listeners
      this._onFullscreenChangeBound = this._onFullscreenChange.bind(this);
      document.addEventListener("fullscreenchange", this._onFullscreenChangeBound);
      document.addEventListener("webkitfullscreenchange", this._onFullscreenChangeBound);
      document.addEventListener("mozfullscreenchange", this._onFullscreenChangeBound);
      document.addEventListener("MSFullscreenChange", this._onFullscreenChangeBound);
      this._onContextMenuBound = function(e) { e.preventDefault(); };
      document.addEventListener("contextmenu", this._onContextMenuBound);

      // Set an empty model immediately to prevent empty bindings
      this.getView().setModel(new sap.ui.model.json.JSONModel({
        questions: [],
        currentIndex: 0,
        currentQuestion: {},
        timeLeft: 900
      }), "questions");

      // Check authentication (async, but do NOT attach route handler here)
      AuthService.getCurrentUser()
        .then(user => {
          this.getView().setModel(new sap.ui.model.json.JSONModel(user), "user");
        })
        .catch(() => {
          MessageBox.error("Unauthorized access.");
          this.getRouter().navTo("login-employee");
        });
    },

    onExit: function() {
      // Remove event listeners
      document.removeEventListener("fullscreenchange", this._onFullscreenChangeBound);
      document.removeEventListener("webkitfullscreenchange", this._onFullscreenChangeBound);
      document.removeEventListener("mozfullscreenchange", this._onFullscreenChangeBound);
      document.removeEventListener("MSFullscreenChange", this._onFullscreenChangeBound);
      document.removeEventListener("contextmenu", this._onContextMenuBound);
    },

    _requestFullscreen: function() {
      var elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { // Chrome, Safari and Opera
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { // IE/Edge
        elem.msRequestFullscreen();
      }
    },

    _onFullscreenChange: function() {
      // If not in fullscreen, auto-submit
      if (
        !document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.mozFullScreenElement &&
        !document.msFullscreenElement
      ) {
        sap.m.MessageBox.warning("You exited fullscreen. The exam will be auto-submitted.");
        this.onSubmitExam(true);
      }
    },

    _onRouteMatched: function (oEvent) {
      // Reset model to empty
      this.getView().setModel(new sap.ui.model.json.JSONModel({
        questions: [],
        currentIndex: 0,
        currentQuestion: {},
        timeLeft: 900
      }), "questions");

      const examId = oEvent.getParameter("arguments").examId;
      const that = this;

      ExamService.getExamQuestions(examId)
        .then(data => {
          console.log("Backend response:", data); // Debug log
          if (!Array.isArray(data) || data.length === 0) {
            MessageBox.warning("No questions found.");
            that._initEmptyModel();
            return;
          }

          data.forEach((q, index) => {
            q.index = index;
            q.status = "notAnswered";
            // Normalize is_msq to boolean
            q.is_msq = q.is_msq === true || q.is_msq === 1 || q.is_msq === "1" || q.is_msq === "true";
            if (q.is_msq) {
              q.selectedIndices = [];
              q.selectedIndex = -1;
            } else {
              q.selectedIndex = -1;
              q.selectedIndices = [];
            }
          });

          console.log("Processed questions:", data); // Debug log

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

          // --- Secure Exam: Request fullscreen after questions are loaded ---
          that._requestFullscreen();
        })
        .catch(err => {
          console.error("Error loading questions:", err); // Debug log
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

    onSelectMSQOption: function (oEvent) {
      const model = this.getView().getModel("questions");
      const index = model.getProperty("/currentIndex");
      const key = parseInt(oEvent.getSource().data("key"), 10);
      const isSelected = oEvent.getParameter("selected");

      let selectedIndices = model.getProperty(`/questions/${index}/selectedIndices`) || [];

      // Always create a new array to trigger UI update
      if (isSelected) {
        if (!selectedIndices.includes(key)) {
          selectedIndices = selectedIndices.concat([key]);
        }
      } else {
        selectedIndices = selectedIndices.filter(i => i !== key);
      }

      model.setProperty(`/questions/${index}/selectedIndices`, selectedIndices);
      model.setProperty("/currentQuestion/selectedIndices", selectedIndices);

      // Update status
      const status = selectedIndices.length > 0 ? "answered" : "notAnswered";
      model.setProperty(`/questions/${index}/status`, status);
      model.setProperty("/currentQuestion/status", status);
      console.log("Selected indices for question", index, selectedIndices);
    },

    onSaveNext: function () {
      const model = this.getView().getModel("questions");
      let index = model.getProperty("/currentIndex");
      const questions = model.getProperty("/questions");

      // Check if current question is answered (for both MCQ and MSQ)
      const currentQuestion = questions[index];
      const isAnswered = currentQuestion.is_msq ? 
        (currentQuestion.selectedIndices && currentQuestion.selectedIndices.length > 0) :
        (currentQuestion.selectedIndex !== -1);

      if (isAnswered) {
        questions[index].status = "answered";
      }

      // Update full questions array to trigger UI refresh
      model.setProperty("/questions", questions);

      if (index < questions.length - 1) {
        index += 1;
        model.setProperty("/currentIndex", index);
        model.setProperty("/currentQuestion", questions[index]);
      }
    },

    onMarkForReview: function () {
      const model = this.getView().getModel("questions");
      let index = model.getProperty("/currentIndex");
      const questions = model.getProperty("/questions");

      questions[index].status = "markedForReview";
      model.setProperty("/questions", questions);

      if (index < questions.length - 1) {
        index += 1;
        model.setProperty("/currentIndex", index);
        model.setProperty("/currentQuestion", questions[index]);
      }
    },

    onClearAnswer: function () {
      const model = this.getView().getModel("questions");
      const index = model.getProperty("/currentIndex");
      const currentQuestion = model.getProperty("/currentQuestion");

      if (currentQuestion.is_msq) {
        model.setProperty(`/questions/${index}/selectedIndices`, []);
        model.setProperty("/currentQuestion/selectedIndices", []);
      } else {
        model.setProperty(`/questions/${index}/selectedIndex`, -1);
        model.setProperty("/currentQuestion/selectedIndex", -1);
      }
      
      model.setProperty(`/questions/${index}/status`, "notAnswered");
      model.setProperty("/currentQuestion/status", "notAnswered");
    },

    onNavigateToQuestion: function (oEvent) {
      const index = oEvent.getSource().data("questionIndex");
      const model = this.getView().getModel("questions");
      const questions = model.getProperty("/questions");

      model.setProperty("/currentIndex", index);
      model.setProperty("/currentQuestion", questions[index]);
    },

    onSubmitExam: function (isAutoSubmit = false) {
      clearInterval(countdownInterval);
      const model = this.getView().getModel("questions");
      const questions = model.getProperty("/questions");

      if (!Array.isArray(questions) || questions.length === 0) {
        MessageBox.error("No questions to submit.");
        return;
      }

      const answers = questions.map(q => {
        if (q.is_msq) {
          // For MSQ: convert selected indices to option letters (A, B, C, D)
          const optionMap = ["A", "B", "C", "D"];
          const selected = (q.selectedIndices || []).map(i => optionMap[i]);
          return { question_id: q.id, answer: selected }; // answer is an array
        } else {
          // For MCQ: convert selected index to option letter
          let answer = null;
          if (q.selectedIndex === 0) answer = "A";
          if (q.selectedIndex === 1) answer = "B";
          if (q.selectedIndex === 2) answer = "C";
          if (q.selectedIndex === 3) answer = "D";
          return { question_id: q.id, answer };
        }
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
    },

    onPreviousQuestion: function () {
      const model = this.getView().getModel("questions");
      let index = model.getProperty("/currentIndex");
      const questions = model.getProperty("/questions");

      if (index > 0) {
        index -= 1;
        model.setProperty("/currentIndex", index);
        model.setProperty("/currentQuestion", questions[index]);
      }
    }
  });
});