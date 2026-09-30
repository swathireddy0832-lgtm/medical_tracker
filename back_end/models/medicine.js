const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        genericName: {
            type: String
        },

        category: {
            type: String,
            required: true
        },

        manufacturer: {
            type: String
        },

        price: {
            type: Number,
            required: true
        },

        quantity: {
            type: Number,
            required: true
        },

        expiryDate: {
            type: Date,
            required: true
        },

        description: {
            type: String
        },

        medicalShop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MedicalShop",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Medicine = mongoose.model("Medicine", medicineSchema);

module.exports = Medicine;