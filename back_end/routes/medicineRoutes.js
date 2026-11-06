const express = require("express");
const router = express.Router();

const Medicine = require("../models/Medicine");
const authMiddleware = require("../middleware/authMiddleware");


// 1. ADD MEDICINE (CREATE)

router.post("/add", authMiddleware, async (req, res) => {
    try {

        if (req.user.role !== "medicalShop") {
            return res.status(403).json({
                message: "Only medical shop owners can add medicines"
            });
        }

        const {
            name,
            genericName,
            category,
            manufacturer,
            price,
            quantity,
            expiryDate,
            description
        } = req.body;

        if (!name || !category || price === undefined ||
            quantity === undefined || !expiryDate) {
            return res.status(400).json({
                message: "Please provide all required medicine details"
            });
        }

        if (Number(price) < 0 || Number(quantity) < 0) {
            return res.status(400).json({
                message: "Price and quantity cannot be negative"
            });
        }

        const medicine = new Medicine({
            name,
            genericName,
            category,
            manufacturer,
            price,
            quantity,
            expiryDate,
            description,
            medicalShop: req.user.id
        });

        await medicine.save();

        res.status(201).json({
            message: "Medicine added successfully",
            medicine
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// 2. VIEW ALL MEDICINES (READ)

router.get("/", async (req, res) => {
    try {

        const medicines = await Medicine.find()
            .populate({
                path: "medicalShop",
                match: {
                    status: "approved",
                    isOpen: true
                },
                select: "shopName address phone latitude longitude"
            });

        const availableMedicines = medicines.filter(
            medicine => medicine.medicalShop !== null
        );

        res.status(200).json({
            count: availableMedicines.length,
            medicines: availableMedicines
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// 3. VIEW SINGLE MEDICINE (READ)

router.get("/:id", async (req, res) => {
    try {

        const medicine = await Medicine.findById(req.params.id)
            .populate({
                path: "medicalShop",
                match: {
                    status: "approved",
                    isOpen: true
                },
                select: "shopName address phone"
            });

        if (!medicine || !medicine.medicalShop) {
            return res.status(404).json({
                message: "Medicine not found or shop unavailable"
            });
        }

        res.status(200).json({
            medicine
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// 4. UPDATE MEDICINE (UPDATE)

router.put("/:id", authMiddleware, async (req, res) => {
    try {

        if (req.user.role !== "medicalShop") {
            return res.status(403).json({
                message: "Only medical shop owners can update medicines"
            });
        }

        const {
            name,
            genericName,
            category,
            manufacturer,
            price,
            quantity,
            expiryDate,
            description
        } = req.body;

        if (
            (price !== undefined && Number(price) < 0) ||
            (quantity !== undefined && Number(quantity) < 0)
        ) {
            return res.status(400).json({
                message: "Price and quantity cannot be negative"
            });
        }

        const medicine = await Medicine.findOne({
            _id: req.params.id,
            medicalShop: req.user.id
        });

        if (!medicine) {
            return res.status(404).json({
                message: "Medicine not found in your shop"
            });
        }

        if (name !== undefined) medicine.name = name;
        if (genericName !== undefined) medicine.genericName = genericName;
        if (category !== undefined) medicine.category = category;
        if (manufacturer !== undefined) medicine.manufacturer = manufacturer;
        if (price !== undefined) medicine.price = price;
        if (quantity !== undefined) medicine.quantity = quantity;
        if (expiryDate !== undefined) medicine.expiryDate = expiryDate;
        if (description !== undefined) medicine.description = description;

        await medicine.save();

        res.status(200).json({
            message: "Medicine updated successfully",
            medicine
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// 5. DELETE MEDICINE (DELETE)

router.delete("/:id", authMiddleware, async (req, res) => {
    try {

        if (req.user.role !== "medicalShop") {
            return res.status(403).json({
                message: "Only medical shop owners can delete medicines"
            });
        }

        const medicine = await Medicine.findOneAndDelete({
            _id: req.params.id,
            medicalShop: req.user.id
        });

        if (!medicine) {
            return res.status(404).json({
                message: "Medicine not found in your shop"
            });
        }

        res.status(200).json({
            message: "Medicine deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// 6. SEARCH MEDICINE

router.get("/search/:name", async (req, res) => {
    try {

        const medicines = await Medicine.find({
            $or: [
                { name: { $regex: req.params.name, $options: "i" } },
                { genericName: { $regex: req.params.name, $options: "i" } }
            ]
        }).populate({
            path: "medicalShop",
            match: {
                status: "approved",
                isOpen: true
            },
            select: "shopName address phone latitude longitude"
        });

        const results = medicines.filter(
            medicine => medicine.medicalShop !== null
        );

        res.status(200).json({
            count: results.length,
            medicines: results
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


module.exports = router;