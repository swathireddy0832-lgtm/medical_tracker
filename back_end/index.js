const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/medicine_tracker")
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection failed:", error);
    });

app.get("/", (req, res) => {
    res.send("Medicine Search and Tracking System Backend is running");
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});