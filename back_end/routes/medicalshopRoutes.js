const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const MedicalShop = require("../models/MedicalShops");

const authMiddleware = require("../middleware/authMiddleware");


// 1. MEDICAL SHOP REGISTRATION

router.post("/register", async (req, res) => {
    try {
        const {
            shopName,
            ownerName,
            email,
            password,
            phone,
            address,
            latitude,
            longitude
        } = req.body;

        if (
            !shopName || !ownerName || !email ||
            !password || !phone || !address ||
            latitude === undefined || longitude === undefined
        ) {
            return res.status(400).json({
                message: "Please provide all required details"
            });
        }

        const existingShop = await MedicalShop.findOne({ email });

        if (existingShop) {
            return res.status(400).json({
                message: "Medical shop already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newShop = new MedicalShop({
            shopName,
            ownerName,
            email,
            password: hashedPassword,
            phone,
            address,
            latitude,
            longitude
        });

        await newShop.save();

        res.status(201).json({
            message: "Medical shop registered successfully. Waiting for admin approval."
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// 2. MEDICAL SHOP LOGIN

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const shop = await MedicalShop.findOne({ email });

        if (!shop) {
            return res.status(404).json({
                message: "Medical shop not found"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            shop.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid password"
            });
        }

        if (shop.status !== "approved") {
            return res.status(403).json({
                message: `Your shop is ${shop.status}. Please contact admin.`
            });
        }

        const token = jwt.sign(
            {
                id: shop._id,
                role: "medicalShop"
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Medical shop login successful",
            token,
            shop: {
                id: shop._id,
                shopName: shop.shopName,
                ownerName: shop.ownerName,
                email: shop.email,
                status: shop.status,
                isOpen: shop.isOpen
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// 3. UPDATE MEDICAL SHOP PROFILE

router.put("/update-profile", authMiddleware, async (req, res) => {
    try {

        if (req.user.role !== "medicalShop") {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const shop = await MedicalShop.findById(req.user.id);

        if (!shop) {
            return res.status(404).json({
                message: "Medical shop not found"
            });
        }

        const {
            shopName,
            ownerName,
            phone,
            address,
            latitude,
            longitude
        } = req.body;

        if (shopName !== undefined) shop.shopName = shopName;
        if (ownerName !== undefined) shop.ownerName = ownerName;
        if (phone !== undefined) shop.phone = phone;
        if (address !== undefined) shop.address = address;
        if (latitude !== undefined) shop.latitude = latitude;
        if (longitude !== undefined) shop.longitude = longitude;

        await shop.save();

        res.status(200).json({
            message: "Medical shop profile updated successfully",
            shop
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// 4. UPDATE SHOP AVAILABILITY STATUS

router.put("/update-status", authMiddleware, async (req, res) => {
    try {

        if (req.user.role !== "medicalShop") {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const { isOpen } = req.body;

        if (typeof isOpen !== "boolean") {
            return res.status(400).json({
                message: "isOpen must be true or false"
            });
        }

        const shop = await MedicalShop.findByIdAndUpdate(
            req.user.id,
            { isOpen },
            { new: true }
        );

        if (!shop) {
            return res.status(404).json({
                message: "Medical shop not found"
            });
        }

        res.status(200).json({
            message: "Shop availability updated successfully",
            isOpen: shop.isOpen
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


module.exports = router;