const express = require("express");
const paymentRoute = express.Router();
const Payment = require('../models/payment');
require("dotenv").config();

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

paymentRoute.post('/create-payment-intent', async (req, res) => {
    const { amount, currency, paymentMethodId, userId } = req.body;
  
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method: paymentMethodId,
            confirm: true,
            automatic_payment_methods: {
              enabled: true,
              allow_redirects: 'never',
          },
      });
      // Enregistrement du paiement dans la base de données
      const payment = new Payment({
        userId,
        amount,
        currency,
        status: paymentIntent.status,
        createdAt: new Date(),
      });
      await payment.save();
  
      res.send({ paymentIntent });
    } catch (error) {
      const payment = new Payment({
        userId,
        amount,
        currency,
        status: 'failed',
        createdAt: new Date(),
      });
      await payment.save();
      res.status(500).send({ error: error.message });
    }
  });
  
  paymentRoute.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
  });

module.exports = paymentRoute;