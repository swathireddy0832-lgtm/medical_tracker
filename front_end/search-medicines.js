const API = "http://localhost:5000";

const token = localStorage.getItem("token");

async function searchMedicines() {
    const searchInput = document.getElementById("searchInput");
    const medicineName = searchInput.value.trim();

    if (!medicineName) {
        alert("Please enter a medicine name.");
        return;
    }

    try {
        const response = await fetch(
            API + "/api/medicines/search/" + encodeURIComponent(medicineName)
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Medicine search failed.");
            return;
        }

        displayMedicines(data.medicines || []);
    } catch (error) {
        console.error(error);
        alert("Unable to connect to backend.");
    }
}

async function loadAllMedicines() {
    try {
        const response = await fetch(API + "/api/medicines");
        const data = await response.json();

        if (response.ok) {
            displayMedicines(data.medicines || []);
        } else {
            alert(data.message || "Unable to load medicines.");
        }
    } catch (error) {
        console.error(error);
        alert("Unable to connect to backend.");
    }
}

function displayMedicines(medicines) {
    const container = document.getElementById("medicineList");

    if (!container) return;

    container.innerHTML = "";

    if (medicines.length === 0) {
        container.innerHTML = "<p>No medicines found.</p>";
        return;
    }

    medicines.forEach(medicine => {
        const name = medicine.name || medicine.medicineName || "Medicine";

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <h3>${name}</h3>
            <p>Generic Name: ${medicine.genericName || "N/A"}</p>
            <p>Category: ${medicine.category || "N/A"}</p>
            <p>Manufacturer: ${medicine.manufacturer || "N/A"}</p>
            <p>Price: ₹${medicine.price}</p>
            <p>Available Quantity: ${medicine.quantity}</p>
            <button onclick="placeOrder('${medicine._id}')">
                Order Now
            </button>
        `;

        container.appendChild(card);
    });
}

async function placeOrder(medicineId) {
    if (!token || localStorage.getItem("role") !== "user") {
        alert("Please login as a user to place an order.");
        window.location.href = "login.html?role=user";
        return;
    }

    const quantity = Number(prompt("Enter required quantity:"));

    if (!Number.isInteger(quantity) || quantity <= 0) {
        alert("Please enter a valid quantity.");
        return;
    }

    try {
        const response = await fetch(API + "/api/orders/place", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                medicineId,
                quantity
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message || "Order placed successfully!");
            loadAllMedicines();
        } else {
            alert(data.message || "Unable to place order.");
        }
    } catch (error) {
        console.error(error);
        alert("Unable to connect to backend.");
    }
}

document.addEventListener("DOMContentLoaded", loadAllMedicines);