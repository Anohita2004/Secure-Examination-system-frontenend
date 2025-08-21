sap.ui.define([], function () {
  "use strict";
  const BASE_URL = "http://localhost:4000/api";

  return {
    getAllPermissions: function() {
      return fetch(BASE_URL + "/permissions", {
        method: "GET",
        credentials: "include"
      }).then(res => {
        if (!res.ok) {
          const err = new Error("Failed to fetch permissions");
          err.status = res.status;
          throw err;
        }
        return res.json();
      }).then(json => json.permissions || json.data || json);
    },

    getAllUsersWithPermissions: function() {
      return fetch(BASE_URL + "/permissions/users", {
        method: "GET",
        credentials: "include"
      }).then(res => {
        if (!res.ok) {
          const err = new Error("Failed to fetch users");
          err.status = res.status;
          throw err;
        }
        return res.json();
      }).then(json => json.users || json.data || json);
    },

    getUserPermissions: function(userId) {
      return fetch(BASE_URL + "/permissions/users/" + userId, {
        method: "GET",
        credentials: "include"
      }).then(res => {
        if (!res.ok) {
          const err = new Error("Failed to fetch user permissions");
          err.status = res.status;
          throw err;
        }
        return res.json();
      }).then(json => json.permissions || json.data || json);
    },

    assignPermission: function(userId, permissionId) {
      return fetch(BASE_URL + "/permissions/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, permissionId }),
        credentials: "include"
      }).then(res => {
        if (!res.ok) {
          const err = new Error("Failed to assign permission");
          err.status = res.status;
          throw err;
        }
        return res.json();
      });
    },

    removePermission: function(userId, permissionId) {
      return fetch(BASE_URL + "/permissions/remove", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, permissionId }),
        credentials: "include"
      }).then(res => {
        if (!res.ok) {
          const err = new Error("Failed to remove permission");
          err.status = res.status;
          throw err;
        }
        return res.json();
      });
    }
  };
});