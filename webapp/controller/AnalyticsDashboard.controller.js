sap.ui.define([
  "./BaseController"
], function (BaseController) {
  "use strict";
  return BaseController.extend("exam.controller.AnalyticsDashboard", {
    onInit: function() {
      var that = this;
      // Fetch exam summary
      fetch("http://localhost:4000/api/analytics/exam-summary")
        .then(res => res.json())
        .then(data => {
          that.getView().setModel(new sap.ui.model.json.JSONModel(data), "summary");
        });
      // Fetch most missed questions
      fetch("http://localhost:4000/api/analytics/most-missed-questions")
        .then(res => res.json())
        .then(data => {
          that.getView().setModel(new sap.ui.model.json.JSONModel(data), "missed");
        });
    }
  });
});