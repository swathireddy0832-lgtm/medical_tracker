const mongoose = require("mongoose");

const medicalShopSchema = new mongoose.Schema(
    {
        shopName: {
            type: String,
            required: true
        },

        ownerName: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        address: {
            type: String,
            required: true
        },

        latitude: {
            type: Number,
            required: true
        },

        longitude: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },

        isOpen: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const MedicalShop = mongoose.model("MedicalShop", medicalShopSchema);

module.exports = MedicalShop;