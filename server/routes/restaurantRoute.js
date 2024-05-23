const express = require('express');
const router = express.Router();
const Restaurant = require('../models/restaurant');

// Create a new restaurant
router.post('/register', async (req, res) => {
    const { name, address, phone, email, ownerId } = req.body;
    try {
        const newRestaurant = new Restaurant({ name, address, phone, email, ownerId });
        await newRestaurant.save();
        res.status(201).json(newRestaurant);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Other CRUD operations...

module.exports = router;
