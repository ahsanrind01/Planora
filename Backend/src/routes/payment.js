// src/routes/paymentRoutes.js
import express from 'express';
import { createPaymentIntent } from '../controllers/payment.js';

const router = express.Router();

// Route: POST /api/payments/create-payment-intent
router.post('/create-payment-intent', createPaymentIntent);

export default router;