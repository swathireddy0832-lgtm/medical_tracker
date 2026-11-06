const API = "http://localhost:5000";

const token = localStorage.getItem("token");

if (!token || localStorage.getItem("role") !== "user") {
    alert("Please login first.");
    window.location.href = "login.html?role=user";
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    if (form) {
        form.addEventListener("submit", submitFeedback);
    }

    loadMyFeedback();
});

async function submitFeedback(event) {
    event.preventDefault();

    const rating = Number(document.getElementById("rating").value);
    const comment = document.getElementById("comment").value.trim();

    if (rating < 1 || rating > 5) {
        alert("Please select a rating between 1 and 5.");
        return;
    }

    if (!comment) {
        alert("Please enter your feedback.");
        return;
    }

    try {
        const response = await fetch(API + "/api/feedback/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ rating, comment })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message || "Feedback submitted successfully!");
            document.querySelector("form").reset();
            loadMyFeedback();
        } else {
            alert(data.message || "Feedback submission failed.");
        }
    } catch (error) {
        console.error(error);
        alert("Unable to connect to backend.");
    }
}

async function loadMyFeedback() {
    try {
        const response = await fetch(API + "/api/feedback/my-feedback", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();

        if (!response.ok) return;

        const container = document.getElementById("feedbackList");

        if (!container) return;

        container.innerHTML = "";

        const feedback = data.feedback || [];

        if (feedback.length === 0) {
            container.innerHTML = "<p>No feedback submitted yet.</p>";
            return;
        }

        feedback.forEach(item => {
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
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "index.html";
}