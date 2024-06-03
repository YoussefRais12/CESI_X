const express = require("express");
const Stripe = require('stripe');
const cors = require("cors");
require("dotenv").config();
const db_connect = require("./config/db_connect");

const app = express();
const stripe = Stripe('sk_test_51PMUzFKJ5LRFuT3XK0gGfYY7jtr2CUDbJP8mQt4IQyNjZq63GUXUDaq1qdGqLkN1UdUDSVm1eZXzNhz6bCFtef1j00tyTYOHs6');

db_connect();
app.use(express.json());
app.use(cors());

// Define the schema for the data collection
const mongoose = require("mongoose");

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
  const { amount, currency, paymentMethodId } = req.body;

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

      res.send({ paymentIntent });
  } catch (error) {
      res.status(500).send({
          error: error.message,
      });
  }
});

//test our server
app.listen(PORT, (err) =>
  err ? console.log(err) : console.log("server is running")
);