const express = require("express");
const Stripe = require('stripe');
const cors = require("cors");
require("dotenv").config();

const mongoose = require("mongoose");
const db_connect = require("./config/db_connect");

const app = express();
const stripe = Stripe('sk_test_51PMUzFKJ5LRFuT3XK0gGfYY7jtr2CUDbJP8mQt4IQyNjZq63GUXUDaq1qdGqLkN1UdUDSVm1eZXzNhz6bCFtef1j00tyTYOHs6');

const Notification = require('./models/Notif');
const Payment = require('./models/payment');

db_connect();
app.use(express.json());
app.use(cors());

// Define the schema for the data collection

const userRoute = require("./routes/userRoute");
const articleRoute = require('./routes/articleRoute');
const restaurantRoute = require('./routes/restaurantRoute');
const deliveryPersonRoute = require('./routes/deliveryPersonRoute');
const menuRoute = require('./routes/menuRoute');


// ------------------------ our routes----------------------------
app.use("/user", userRoute);
app.use('/article', articleRoute);
app.use('/restaurant', restaurantRoute);
app.use('/deliveryPerson', deliveryPersonRoute);
app.use('/menu', menuRoute);

// ------------------------ end our routes------------------------

PORT = process.env.PORT || 5000;

app.post('/create-payment-intent', async (req, res) => {
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

app.post('/notifications', async (req, res) => {
  const { userId, message } = req.body;

  try {
    const notification = new Notification({
      userId,
      message,
      createdAt: new Date(),
    });
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/notifications', async (req, res) => {
  const { userId } = req.query;

  try {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/notifications/:id', async (req, res) => {
  try {
      const { id } = req.params;
      await Notification.findByIdAndDelete(id);
      res.status(200).send({ message: 'Notification deleted successfully' });
  } catch (error) {
      res.status(500).send({ error: error.message });
  }
});

app.get('/payments/:userId', async (req, res) => {
  try {
      const { userId } = req.params;
      const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
      res.json(payments);
  } catch (error) {
      res.status(500).send({ error: error.message });
  }
});

//test our server
app.listen(PORT, (err) =>
  err ? console.log(err) : console.log("server is running")
);