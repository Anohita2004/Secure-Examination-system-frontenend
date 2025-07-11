sap.ui.define([], function () {
    "use strict";
    const BASE_URL = "http://localhost:4000/api";

    return {
        login: function(email, password) {
            console.log("AuthService.login called", email, password); 
            return fetch(BASE_URL + "/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include" // <-- important!
            })
            .then(res => {
                console.log("Raw fetch response:", res);
                if (!res.ok) {
                    return res.text().then(text => {
                        console.error("Login failed response text:", text);
                        throw new Error("Login failed with status " + res.status);
                    });
                }
                return res.json();
            })
            // No sessionStorage here!
            .catch(err => {
                console.error("Login error caught:", err);
                throw err;
            });
        },

        getCurrentUser: async function () {
            const res = await fetch(BASE_URL + "/auth/me", {
                credentials: "include"
            });
            if (!res.ok) throw new Error("Not authenticated");
            return await res.json(); // { userId, role, email, name }
        },

        logout: function() {
            return fetch(BASE_URL + "/auth/logout", {
                method: "POST",
                credentials: "include"
            });
        }
    };
});