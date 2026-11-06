const express = require("express");
const router = express.Router();

const Feedback = require("../models/Feedback");
const authMiddleware = require("../middleware/authMiddleware");

// Check Feedback model
console.log("Feedback model type:", typeof Feedback);
console.log("Feedback.find type:", typeof Feedback.find);


// 1. User - Submit Feedback
router.post("/submit", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "user") {
            return res.status(403).json({
                message: "Only users can submit feedback"
            });
        }

        const { comment, rating, medicalShop } = req.body;

        if (!comment || rating === undefined || rating === null) {
            return res.status(400).json({
                message: "Comment and rating are required"
            });
        }

        if (!Number.isInteger(Number(rating)) || rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        const feedback = new Feedback({
            user: req.user.id,
            medicalShop,
            comment,
            rating
        });

        await feedback.save();

        res.status(201).json({
            message: "Feedback submitted successfully",
            feedback
        });

    } catch (error) {
        res.status(500).json({
            message: "Error submitting feedback",
            error: error.message
        });
    }
});


// 2. User - View Own Feedback
router.get("/my-feedback", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "user") {
            return res.status(403).json({
                message: "Only users can view their feedback"
            });
        }

        const feedback = await Feedback.find({
            user: req.user.id
        }).populate("medicalShop", "shopName");

        res.status(200).json({
            count: feedback.length,
            feedback
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching feedback",
            error: error.message
        });
    }
});


// 3. Medical Shop Owner - View Feedback
router.get("/shop-feedback", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "medicalShop") {
            return res.status(403).json({
                message: "Only medical shop owners can view feedback"
            });
        }

        const feedback = await Feedback.find({
            medicalShop: req.user.id
        }).populate("user", "name email");

        res.status(200).json({
            count: feedback.length,
            feedback
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching shop feedback",
            error: error.message
        });
    }
});
// 4. Admin - View All Feedback
router.get("/all", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Only admin can view all feedback"
            });
        }

        const feedback = await Feedback.find()
            .populate("user", "name email")
            .populate("medicalShop", "shopName");

        res.status(200).json({
            count: feedback.length,
            feedback
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching all feedback",
            error: error.message
        });
    }
});
module.exports = router;