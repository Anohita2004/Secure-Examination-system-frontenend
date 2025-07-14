/*sap.ui.define(["exam/model/AuthService"], function (AuthService) {
  "use strict";
  const BASE_URL = "http://localhost:4000/api";

  function getAuthHeaders() {
    const token = AuthService.getToken();
    return token ? { "Authorization": "Bearer " + token } : {};
  }

  return {
    createExam: function(examData) {
      return fetch(BASE_URL + "/exam/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify(examData)
      }).then(res => res.json());
    },
    addQuestion: function(questionData) {
      return fetch(BASE_URL + "/exam/add-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify(questionData)
      }).then(res => res.json());
    },
    assignExam: function(assignData) {
      return fetch(BASE_URL + "/exam/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify(assignData)
      }).then(res => res.json());
    },
    getAssignedExams: function(userId) {
  return fetch(BASE_URL + "/exam/assigned/" + userId, {
    method: "GET",
    headers: {
      ...getAuthHeaders()
    }
  }).then(res => res.json());
},
 getExamQuestions: function(examId) {
  return fetch(BASE_URL + "/exam/" + examId + "/questions", {
    method: "GET",
    headers: {
      ...getAuthHeaders()
    }
  }).then(res => res.json());
},
submitExamAnswers: function(examId, userId, answers) {
  return fetch(BASE_URL + "/exam/" + examId + "/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify({ user_id: userId, answers: answers })
  }).then(res => res.json());
},
getUserExamResult: function(examId, userId) {
  return fetch(BASE_URL + "/exam/" + examId + "/result/" + userId, {
    method: "GET",
    headers: {
      ...getAuthHeaders()
    }
  }).then(res => res.json());
},
getAllExamResults: function(examId) {
  return fetch(BASE_URL + "/exam/" + examId + "/results", {
    method: "GET",
    headers: {
      ...getAuthHeaders()
    }
  }).then(res => res.json());
},
  };
});*/
sap.ui.define([], function () {
  "use strict";
  const BASE_URL = "http://localhost:4000/api";

  return {
    createExam: function(examData) {
      return fetch(BASE_URL + "/exam/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(examData),
        credentials: "include"
      }).then(res => res.json());
    },
    addQuestion: function(questionData) {
      return fetch(BASE_URL + "/exam/add-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(questionData),
        credentials: "include"
      }).then(res => res.json());
    },
    /*assignExam: function(assignData) {
      return fetch(BASE_URL + "/exam/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(assignData),
        credentials: "include"
      }).then(res => res.json());
    }*/
   assignExam: function(assignData) {
  return fetch(BASE_URL + "/exam/assign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(assignData),
    credentials: "include"
  }).then(async res => {
    const data = await res.json();
    if (!res.ok) {
      // Attach status for further handling if needed
      throw data;
    }
    return data;
  });
},
    getAssignedExams: function(userId) {
      return fetch(BASE_URL + "/exam/assigned/" + userId, {
        method: "GET",
        credentials: "include"
      }).then(res => res.json());
    },
    getExamQuestions: function(examId) {
      return fetch(BASE_URL + "/exam/" + examId + "/questions", {
        method: "GET",
        credentials: "include"
      }).then(res => res.json());
    },
    submitExamAnswers: function(examId, userId, answers) {
      return fetch(BASE_URL + "/exam/" + examId + "/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ user_id: userId, answers: answers }),
        credentials: "include"
      }).then(res => res.json());
    },
    getUserExamResult: function(examId, userId) {
      return fetch(BASE_URL + "/exam/" + examId + "/result/" + userId, {
        method: "GET",
        credentials: "include"
      }).then(res => res.json());
    },
    getAllExamResults: function(examId) {
      return fetch(BASE_URL + "/exam/" + examId + "/results", {
        method: "GET",
        credentials: "include"
      }).then(res => res.json());
    }
  };
});