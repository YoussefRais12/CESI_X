const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db_connect = require("./config/db_connect");

const app = express();

db_connect();
app.use(express.json());
app.use(cors());

// Define the schema for the data collection
const mongoose = require("mongoose");

const userRoute = require("./routes/userRoute");
const articleRoute = require('./routes/articleRoute');
const restaurantRoute = require('./routes/restaurantRoute');
const deliveryPersonRoute = require('./routes/deliveryPersonRoute');


// ------------------------ our routes----------------------------
app.use("/user", userRoute);
app.use('/article', articleRoute);
app.use('/restaurant', restaurantRoute);
app.use('/deliveryPerson', deliveryPersonRoute);

// ------------------------ end our routes------------------------

PORT = process.env.PORT;

//test our server
app.listen(PORT, (err) =>
  err ? console.log(err) : console.log("server is running")
);