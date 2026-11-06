const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        medicalShop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MedicalShop",
            required: true
        },

        medicine: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Medicine",
            required: true
        },
        quantity: {
    type: Number,
    required: true,
    min: 1
},

        totalPrice: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "confirmed", "rejected", "completed"],
            default: "pending"
        },

        deliveryAddress: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;