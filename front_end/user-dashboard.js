const API = "http://localhost:5000";

// Check login
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "user") {
    alert("Please login first.");
    window.location.href = "login.html?role=user";
}

// Logout
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    alert("Logged out successfully!");

    window.location.href = "index.html";
}

// View Profile
async function showProfile() {
    try {
        const response = await fetch(API + "/api/users/profile", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();

        if (response.ok) {
            const user = data.user;

            alert(
                "MY PROFILE\n\n" +
                "Name: " + user.name + "\n" +
                "Email: " + user.email + "\n" +
                "Phone: " + user.phone + "\n" +
                "Address: " + user.address
            );

        } else {
            alert(data.message || "Unable to fetch profile.");
        }

    } catch (error) {
        console.error(error);
        alert("Unable to connect to backend.");
    }
}

// View Orders
async function viewOrders() {
    try {
        const response = await fetch(API + "/api/orders/my-orders", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();

        if (response.ok) {
            if (data.orders && data.orders.length > 0) {
                let details = "My Orders:\n\n";

                data.orders.forEach((order, index) => {
                    details +=
                        "Order " + (index + 1) +
                        "\nStatus: " + order.status +
                        "\n\n";
                });

                alert(details);

            } else {
                alert("You have not placed any orders yet.");
            }

        } else {
            alert(data.message || "Unable to fetch orders.");
        }

    } catch (error) {
        console.error(error);
        alert("Unable to connect to backend.");
    }
}