const axios = require("axios");
require("dotenv").config();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

if (!PAYSTACK_SECRET) {
    throw new Error("❌ PAYSTACK_SECRET is missing in environment variables");
}

const paystackAPI = axios.create({
    baseURL: PAYSTACK_BASE_URL,
    headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
    },
});

// Initialize Paystack payment
const initializePayment = async ({ email, amount, metadata, callback_url }) => {
    try {
        const response = await paystackAPI.post("/transaction/initialize", {
            email,
            amount, // in kobo
            metadata,
            callback_url,
        });

        return response.data; // return full Paystack response
    } catch (error) {
        console.error("❌ Paystack Initialize Error:", error.response?.data || error.message);
        throw new Error("Payment initialization failed");
    }
};

// Verify Paystack payment
const verifyPayment = async (reference) => {
    try {
        const { data } = await paystackAPI.get(`/transaction/verify/${reference}`);
        return data;
    } catch (error) {
        console.error("❌ Paystack Verify Error:", error.response?.data || error.message);
        throw new Error("Payment verification failed");
    }
};

module.exports = {
    initializePayment,
    verifyPayment,
};
