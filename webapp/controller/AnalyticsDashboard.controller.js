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
          // Prepare pass/fail data for pie chart
          let totalPass = 0, totalFail = 0;
          data.forEach(e => {
            totalPass += Number(e.pass_count);
            totalFail += Number(e.fail_count);
          });
          const passfailData = [
            { label: "Pass", value: totalPass },
            { label: "Fail", value: totalFail }
          ];
          that.getView().setModel(new sap.ui.model.json.JSONModel(passfailData), "passfail");
          console.log("Exam summary data:", data);
          console.log("Pass/Fail pie data:", passfailData);
        });
      // Fetch most missed questions
    fetch("http://localhost:4000/api/analytics/most-missed-questions")
  .then(res => res.json())
  .then(data => {
    data.forEach(d => d.metric = "Wrong Answers");
    that.getView().setModel(new sap.ui.model.json.JSONModel(data), "missed");
    console.log("Most missed questions data:", data);
  });
    }
  });
});