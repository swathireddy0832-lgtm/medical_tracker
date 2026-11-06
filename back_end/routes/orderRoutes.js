const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Medicine = require("../models/Medicine");
const MedicalShop = require("../models/MedicalShops");
const authMiddleware = require("../middleware/authMiddleware");

// 1. User places an order
router.post("/place", authMiddleware, async (req, res) => {
    try {
        // Only users can place orders
        if (req.user.role !== "user") {
            return res.status(403).json({
                message: "Only users can place orders"
            });
        }

        const { medicineId, quantity, deliveryAddress } = req.body;

        if (!medicineId || !Number.isInteger(quantity) ||
            quantity <= 0 || !deliveryAddress) {
            return res.status(400).json({
                message: "Valid medicineId, quantity and deliveryAddress are required"
            });
        }

        // Find medicine
        const medicine = await Medicine.findById(medicineId);

        if (!medicine) {
            return res.status(404).json({
                message: "Medicine not found"
            });
        }

        // Check medical shop
        const shop = await MedicalShop.findOne({
            _id: medicine.medicalShop,
            status: "approved",
            isOpen: true
        });

        if (!shop) {
            return res.status(400).json({
                message: "Medical shop is closed or not approved"
            });
        }

        // Check stock
        if (medicine.quantity < quantity) {
            return res.status(400).json({
                message: "Insufficient medicine stock"
            });
        }

        // Calculate total price using database price
        const totalPrice = medicine.price * quantity;

        // Reduce stock
        const updatedMedicine = await Medicine.findOneAndUpdate(
            {
                _id: medicineId,
                quantity: { $gte: quantity }
            },
            {
                $inc: { quantity: -quantity }
            },
            { new: true }
        );

        if (!updatedMedicine) {
            return res.status(400).json({
                message: "Insufficient stock. Please try again."
            });
        }

        // Create order
        const order = new Order({
            user: req.user.id,
            medicalShop: medicine.medicalShop,
            medicine: medicineId,
            quantity,
            totalPrice,
            deliveryAddress
        });

        await order.save();

        res.status(201).json({
            message: "Order placed successfully",
            order
        });

    } catch (error) {
        res.status(500).json({
            message: "Error placing order",
            error: error.message
        });
    }
});
// 3. Medical Shop Owner - View Customer Orders
router.get("/shop-orders", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "medicalShop") {
            return res.status(403).json({
                message: "Only medical shop owners can view orders"
            });
        }

        const orders = await Order.find({
            medicalShop: req.user.id
        })
        .populate("user", "name email phone")
        .populate("medicine", "name price");

        res.status(200).json({
            count: orders.length,
            orders
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching shop orders",
            error: error.message
        });
    }
});
// 4. Medical Shop Owner - Update Order Status
router.put("/update-status/:id", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "medicalShop") {
            return res.status(403).json({
                message: "Only medical shop owners can update orders"
            });
        }

        const { status } = req.body;

        const allowedStatuses = ["confirmed", "rejected", "completed"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        const order = await Order.findOne({
            _id: req.params.id,
            medicalShop: req.user.id
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found in your shop"
            });
        }

        if (
            (status === "confirmed" || status === "rejected") &&
            order.status !== "pending"
        ) {
            return res.status(400).json({
                message: "Only pending orders can be confirmed or rejected"
            });
        }

        if (status === "completed" && order.status !== "confirmed") {
            return res.status(400).json({
                message: "Only confirmed orders can be completed"
            });
        }

        if (status === "rejected") {
            await Medicine.findByIdAndUpdate(
                order.medicine,
                { $inc: { quantity: order.quantity } }
            );
        }

        order.status = status;
        await order.save();

        res.status(200).json({
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        res.status(500).json({
            message: "Error updating order status",
            error: error.message
        });
    }
});
module.exports = router;