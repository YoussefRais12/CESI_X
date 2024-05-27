const express = require("express");
const router = express.Router();
const Restaurant = require("../models/restaurant");

// Create a new restaurant
router.post("/register", async (req, res) => {
  const { name, address, phone, email, ownerId } = req.body;
  try {
    const newRestaurant = new Restaurant({
      name,
      address,
      phone,
      email,
      ownerId,
    });
    await newRestaurant.save();
    res.status(201).json(newRestaurant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/data.registered", async (req, res) => {
  const { ownerId } = req.params;
  try {
    const restaurant = await Restaurant.findById(ownerId);
    res.json(restaurant);
  } catch (error) {
    console.error("An error occured:", error.message);
    return { error: "Veuillez rééssayer je vous prie" };
  }
});

router.delete("/:dropid", async (req, res) => {
  const { id } = req.params;
  try {
    const restaurant = await Restaurant.findByIdAndDelete(id);
    if (!restaurant) {
      console.error("An error occured:", error.message);
      return res
        .status(404)
        .json({ error: "The restaurant hasn't been found" });
    }
    res.status(200).json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    console.error("An error occured:", error.message);
    return { error: "Let's try again please:" };
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      console.error("An error occured:", error.message);
      return res
        .status(404)
        .json({ error: "The restaurant hasn't been found" });
    }
    res.status(200).json(restaurant);
  } catch (error) {
    console.error("An error occured:", error.message);
    return res.status(200).json({ error: "The restaurant hasn't been found" });
  }
});

router.get("/:name", async (req, res) => {
    const { name } = req.params;
    try {
      const restaurant = await Restaurant.findOne(name);
      if (!restaurant) {
        console.error("An error occured:", error.message);
        return res
          .status(404)
          .json({ error: "The restaurant hasn't been found" });
      }
      res.status(200).json(restaurant);
    } catch (error) {
      console.error("An error occured:", error.message);
      return res.status(200).json({ error: "The restaurant hasn't been found" });
    }
  });
// Other CRUD operations...

module.exports = router;
