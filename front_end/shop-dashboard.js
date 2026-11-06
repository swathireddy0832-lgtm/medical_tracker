const API = "http://localhost:5000";

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "medicalShop") {
    alert("Please login as a medical shop owner.");
    window.location.href = "login.html?role=medicalShop";
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    alert("Logged out successfully!");
    window.location.href = "index.html";
}

async function addMedicine(event) {
    if (event) event.preventDefault();

    const medicine = {
        name: document.getElementById("name").value.trim(),
        genericName: document.getElementById("genericName").value.trim(),
        category: document.getElementById("category").value.trim(),
        manufacturer: document.getElementById("manufacturer").value.trim(),
        price: Number(document.getElementById("price").value),
        quantity: Number(document.getElementById("quantity").value),
        expiryDate: document.getElementById("expiryDate").value
    };

    if (!medicine.name || medicine.price <= 0 || medicine.quantity < 0) {
        alert("Please enter valid medicine details.");
        return;
    }

    try {
        const response = await fetch(API + "/api/medicines/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(medicine)
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message || "Medicine added successfully!");
            document.querySelector("form")?.reset();
        } else {
            alert(data.message || "Unable to add medicine.");
        }
    } catch (error) {
        console.error(error);
        alert("Unable to connect to backend.");
    }
}

async function viewShopOrders() {
    try {
        const response = await fetch(API + "/api/orders/shop-orders", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to fetch orders.");
            return;
        }

        const orders = data.orders || [];

        if (orders.length === 0) {
            alert("No orders received yet.");
            return;
        }

        let details = "SHOP ORDERS\n\n";

        orders.forEach((order, index) => {
            details +=
                "Order " + (index + 1) + "\n" +
                "Order ID: " + order._id + "\n" +
                "Quantity: " + order.quantity + "\n" +
                "Status: " + order.status + "\n\n";
        });

        alert(details);
    } catch (error) {
        console.error(error);
        alert("Unable to connect to backend.");
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(
            API + "/api/orders/update-status/" + orderId,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ status })
            }
        );

        const data = await response.json();

        if (response.ok) {
            alert(data.message || "Order status updated!");
            viewShopOrders();
        } else {
            alert(data.message || "Unable to update order.");
        }
    } catch (error) {
        console.error(error);
        alert("Unable to connect to backend.");
    }
}

async function updateShopStatus(status) {
    try {
        const response = await fetch(API + "/api/medical-shops/update-status", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message || "Shop status updated!");
        } else {
            alert(data.message || "Unable to update shop status.");
        }
    } catch (error) {
        console.error(error);
        alert("Unable to connect to backend.");
    }
}