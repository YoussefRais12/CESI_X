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
// const dataSchema = new mongoose.Schema({
//   data: [{
//     type: String,
//     required: true,
//   }],
// });

// // Create the data model
// const Data = mongoose.model("Data", dataSchema);

// Handle the POST request
// app.post("/", async (req, res) => {
//   const { data } = req.body;

//   // Create a new data document
//   const newData = new Data({
//     data,
//   });

//   // Save the data document to the database
//   try {
//     await newData.save();
//     res.status(200).json({ message: "Données importées avec succès" });
//   } catch (error) {
//     console.error("Erreur lors de l'importation des données:", error);
//     res.status(500).json({ message: "Erreur lors de l'importation des données" });
//   }
// });

// ------------------------ our routes----------------------------
app.use("/user", require("./routes/userRoute"));
// ------------------------ end our routes------------------------

PORT = process.env.PORT;

//test our server
app.listen(PORT, (err) =>
  err ? console.log(err) : console.log("server is running")
);