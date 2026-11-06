const API = "http://localhost:5000";

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "admin") {
    alert("Please login as admin.");
    window.location.href = "login.html?role=admin";
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    alert("Logged out successfully!");
    window.location.href = "index.html";
}

async function loadShops() {
    try {
        const response = await fetch(API + "/api/admin/shops", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to load shops.");
            return;
        }

        const container = document.getElementById("shopList");

        if (!container) return;

        container.innerHTML = "";

        (data.shops || []).forEach(shop => {
            const card = document.createElement("div");
            card.className = "card";

            card.innerHTML = `
                <h3>${shop.shopName || shop.name || "Medical Shop"}</h3>
                <p>Email: ${shop.email || ""}</p>
                <p>Status: ${shop.status || shop.approvalStatus || ""}</p>
                <button onclick="approveShop('${shop._id}')">
                    Approve
                </button>
                <button onclick="rejectShop('${shop._id}')">
                    Reject
                </button>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        alert("Unable to connect to backend.");
    }
}

async function approveShop(id) {
    await updateShopApproval(id, "approve");
}

async function rejectShop(id) {
    await updateShopApproval(id, "reject");
}

async function updateShopApproval(id, action) {
    try {
        const response = await fetch(
            API + "/api/admin/shops/" + action + "/" + id,
            {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const data = await response.json();

        if (response.ok) {
            alert(data.message || "Shop updated successfully!");
            loadShops();
        } else {
            alert(data.message || "Unable to update shop.");
        }
    } catch (error) {
        console.error(error);
        alert("Unable to connect to backend.");
    }
}

async function loadMedicines() {
    try {
        const response = await fetch(API + "/api/admin/medicines", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to load medicines.");
            return;
        }

        const container = document.getElementById("medicineList");

        if (!container) return;

        container.innerHTML = "";

        (data.medicines || []).forEach(medicine => {
            const card = document.createElement("div");
            card.className = "card";

            card.innerHTML = `
                <h3>${medicine.name || medicine.medicineName || "Medicine"}</h3>
                <p>Price: ₹${medicine.price}</p>
                <p>Quantity: ${medicine.quantity}</p>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        alert("Unable to connect to backend.");
    }
}

async function loadOrders() {
    try {
        const response = await fetch(API + "/api/admin/orders", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to load orders.");
            return;
        }

        const container = document.getElementById("orderList");

        if (!container) return;

        container.innerHTML = "";

        (data.orders || []).forEach(order => {
            const card = document.createElement("div");
            card.className = "card";

            card.innerHTML = `
                <h3>Order ID: ${order._id}</h3>
                <p>Quantity: ${order.quantity}</p>
                <p>Status: ${order.status}</p>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        alert("Unable to connect to backend.");
    }
}

async function loadFeedback() {
    try {
        const response = await fetch(API + "/api/feedback/all", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to load feedback.");
            return;
        }

        const container = document.getElementById("feedbackList");

        if (!container) return;

        container.innerHTML = "";

        (data.feedback || []).forEach(item => {
            const card = document.createElement("div");
            card.className = "card";

            card.innerHTML = `
                <h3>Rating: ${item.rating}/5</h3>
                <p>${item.comment}</p>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        alert("Unable to connect to backend.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("shopList")) loadShops();
    if (document.getElementById("medicineList")) loadMedicines();
    if (document.getElementById("orderList")) loadOrders();
    if (document.getElementById("feedbackList")) loadFeedback();
});