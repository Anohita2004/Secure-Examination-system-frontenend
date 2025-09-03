sap.ui.define([
  "./BaseController",
  "sap/m/MessageToast"
], function (BaseController, MessageToast) {
  "use strict";

  return BaseController.extend("exam.controller.ExamIntro", {
    onInit: function () {
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.getRoute("exam-intro").attachPatternMatched(this._onRouteMatched, this);
    },

    _onRouteMatched: function (oEvent) {
      this._examId = oEvent.getParameter("arguments").examId;
      console.log("Intro for Exam ID:", this._examId);
    },

    onStartExam: function () {
      // Force fullscreen
      const elem = document.documentElement;
      if (elem.requestFullscreen) elem.requestFullscreen();

      // Navigate to the actual exam page
      this.getOwnerComponent().getRouter().navTo("exam", {
        examId: this._examId
      });

      MessageToast.show("Exam started in secure mode.");
    }
  });
});
