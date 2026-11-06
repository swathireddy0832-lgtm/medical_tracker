const API = "http://localhost:5000";

const params = new URLSearchParams(window.location.search);
const role = params.get("role");

const userFields = document.getElementById("userFields");
const shopFields = document.getElementById("shopFields");
const title = document.getElementById("registerTitle");

// Display fields based on selected role
if (role === "user") {
    title.innerText = "User Registration";
    userFields.style.display = "block";
    shopFields.style.display = "none";

} else if (role === "medicalShop") {
    title.innerText = "Medical Shop Registration";
    userFields.style.display = "none";
    shopFields.style.display = "block";

} else {
    title.innerText = "Invalid Registration Role";
}

document.getElementById("loginLink").href =
    "login.html?role=" + role;

// Registration form submission
document.getElementById("registerForm")
.addEventListener("submit", async function(e) {

    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    let endpoint;
    let body;

    if (role === "user") {

        endpoint = "/api/users/register";

        body = {
            name: document.getElementById("name").value,
            email: email,
            password: password,
            phone: document.getElementById("phone").value,
            address: document.getElementById("address").value
        };

    } else if (role === "medicalShop") {

        endpoint = "/api/medical-shops/register";

        body = {
            shopName: document.getElementById("shopName").value,
            ownerName: document.getElementById("ownerName").value,
            email: email,
            password: password,
            phone: document.getElementById("shopPhone").value,
            address: document.getElementById("shopAddress").value,
            latitude: Number(document.getElementById("latitude").value),
            longitude: Number(document.getElementById("longitude").value)
        };

    } else {
        alert("Invalid registration role");
        return;
    }

    try {

        const response = await fetch(API + endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        document.getElementById("message").innerText =
            data.message || "Registration completed";

        if (response.ok) {
            alert("Registration successful! Please login.");

            window.location.href = "login.html?role=" + role;
        }

    } catch (error) {

        document.getElementById("message").innerText =
            "Unable to connect to backend.";

        console.error("Registration error:", error);
    }
});