const API = "http://localhost:5000";

const params = new URLSearchParams(window.location.search);
const role = params.get("role");

// Role titles
const roleNames = {
    user: "User Login",
    medicalShop: "Medical Shop Owner Login",
    admin: "Admin Login"
};

document.getElementById("loginTitle").innerText =
    roleNames[role] || "Login to MediTrack";

// Login API endpoints
const endpoints = {
    user: "/api/users/login",
    medicalShop: "/api/medical-shops/login",
    admin: "/api/admin/login"
};

// Login functionality
document.getElementById("loginForm")
.addEventListener("submit", async function(e) {

    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const message = document.getElementById("message");

    if (!endpoints[role]) {
        message.innerText = "Invalid login role.";
        return;
    }

    message.innerText = "Logging in...";

    try {

        const response = await fetch(API + endpoints[role], {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })

        });

        const data = await response.json();

        if (response.ok) {

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", role);

            message.innerText = "Login successful!";

            alert("Welcome to MediTrack!");

            // Dashboard Redirection
            if (role === "user") {
                window.location.href = "user-dashboard.html";
            }
            else if (role === "medicalShop") {
                window.location.href = "shop-dashboard.html";
            }
            else if (role === "admin") {
                window.location.href = "admin-dashboard.html";
            }

        } else {

            message.innerText =
                data.message || "Invalid email or password.";

        }

    } catch (error) {

        message.innerText =
            "Unable to connect to backend.";

        console.error("Login Error:", error);

    }

});