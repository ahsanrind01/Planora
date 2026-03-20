import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
    try {
        const { amount } = req.body; 

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, 
            currency: 'usd', 
            automatic_payment_methods: {
                enabled: true,
            },
        });
        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });

    } catch (error) {
        console.error("❌ Stripe PaymentIntent Error:", error.message);
        res.status(500).json({ error: 'Failed to initialize payment.' });
    }
};