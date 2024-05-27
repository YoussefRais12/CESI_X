const express = require('express');
const restaurantRoute = express.Router();
const Restaurant = require('../models/restaurant');
const Article = require('../models/article');
const isAuth = require("../middleware/passport");

// Create a new restaurant
restaurantRoute.post('/register', async (req, res) => {
    const { name, address, phone, email, ownerId } = req.body;
    try {
        // Check if a restaurant with the same name already exists
        const existingRestaurant = await Restaurant.findOne({ name });
        if (existingRestaurant) {
            return res.status(400).json({ error: "A restaurant with this name already exists." });
        }

        const newRestaurant = new Restaurant({ name, address, phone, email, ownerId });
        await newRestaurant.save();
        res.status(201).json(newRestaurant);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all articles for a specific restaurant
restaurantRoute.get('/:id/articles',  async (req, res) => {
    const { id } = req.params;
    try {
        const articles = await Article.find({ restaurantId: id });
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Other CRUD operations...

module.exports = restaurantRoute;
