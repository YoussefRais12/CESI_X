const express = require('express');
const menuRoute = express.Router();
const restaurantRoute = express.Router();
const Restaurant = require('../models/restaurant');
const Menu = require('../models/menu');
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

// Get all restaurants
restaurantRoute.get('/all' ,async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a restaurant by ID
restaurantRoute.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const restaurant = await Restaurant.findById(id).populate('articles menus');
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        res.status(200).json(restaurant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a restaurant by ID
restaurantRoute.put('/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    const { name, address, phone, email } = req.body;
    try {
        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        // Update the restaurant's fields
        restaurant.name = name !== undefined ? name : restaurant.name;
        restaurant.address = address !== undefined ? address : restaurant.address;
        restaurant.phone = phone !== undefined ? phone : restaurant.phone;
        restaurant.email = email !== undefined ? email : restaurant.email;

        await restaurant.save();
        res.status(200).json(restaurant);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a restaurant by ID
restaurantRoute.delete('/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    try {
        const restaurant = await Restaurant.findByIdAndDelete(id);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        res.status(200).json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//-----------------------------------------------------------------
//                    touskié menu / article
//-----------------------------------------------------------------

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

// Get all menus for a specific restaurant
restaurantRoute.get('/:id/menus', isAuth(), async (req, res) => {
    const { id } = req.params;
    try {
        const menus = await Menu.find({ restaurantId: id }).populate('articles');
        res.status(200).json(menus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = restaurantRoute;
