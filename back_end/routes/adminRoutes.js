const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();

const MedicalShop = require("../models/MedicalShops");
const Medicine = require("../models/Medicine");
const Order = require("../models/Order");

const authMiddleware = require("../middleware/authMiddleware");

// Admin authorization
const adminOnly = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access denied. Admin only."
        });
    }

    next();
};

// 1. Admin Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            email !== process.env.ADMIN_EMAIL ||
            password !== process.env.ADMIN_PASSWORD
        ) {
            return res.status(401).json({
                message: "Invalid admin email or password"
            });
        }

        const token = jwt.sign(
            { id: "admin", role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Admin login successful",
            token
        });

    } catch (error) {
        res.status(500).json({
            message: "Admin login failed",
            error: error.message
        });
    }
});

// 2. View All Registered Medical Shops
router.get("/shops", authMiddleware, adminOnly, async (req, res) => {
    try {
        const shops = await MedicalShop.find().select("-password");

        res.status(200).json({
            count: shops.length,
            shops
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching medical shops",
            error: error.message
        });
    }
});

// 3. Approve Medical Shop
router.put("/shops/approve/:id", authMiddleware, adminOnly, async (req, res) => {
    try {
        const shop = await MedicalShop.findByIdAndUpdate(
            req.params.id,
            { status: "approved" },
            { new: true }
        ).select("-password");

        if (!shop) {
            return res.status(404).json({
                message: "Medical shop not found"
            });
        }

        res.status(200).json({
            message: "Medical shop approved successfully",
            shop
        });

    } catch (error) {
        res.status(500).json({
            message: "Error approving medical shop",
            error: error.message
        });
    }
});

// 4. Reject Medical Shop
router.put("/shops/reject/:id", authMiddleware, adminOnly, async (req, res) => {
    try {
        const shop = await MedicalShop.findByIdAndUpdate(
            req.params.id,
            { status: "rejected" },
            { new: true }
        ).select("-password");

        if (!shop) {
            return res.status(404).json({
                message: "Medical shop not found"
            });
        }

        res.status(200).json({
            message: "Medical shop rejected successfully",
            shop
        });

    } catch (error) {
        res.status(500).json({
            message: "Error rejecting medical shop",
            error: error.message
        });
    }
});

// 5. Admin - View All Medicines
router.get("/medicines", authMiddleware, adminOnly, async (req, res) => {
    try {
        const medicines = await Medicine.find()
            .populate("medicalShop", "shopName");

        res.status(200).json({
            count: medicines.length,
            medicines
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching medicines",
            error: error.message
        });
    }
});

// 6. Admin - View All Orders
router.get("/orders", authMiddleware, adminOnly, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .populate("medicalShop", "shopName")
            .populate("medicine", "name price");

        res.status(200).json({
            count: orders.length,
            orders
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching orders",
            error: error.message
        });
    }
});

module.exports = router;