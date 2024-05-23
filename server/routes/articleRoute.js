const express = require('express');
const router = express.Router();
const Article = require('../models/article');

// Create a new article
router.post('/', async (req, res) => {
    const { name, price, description, restaurantId } = req.body;
    try {
        const newArticle = new Article({ name, price, description, restaurantId });
        await newArticle.save();
        res.status(201).json(newArticle);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Other CRUD operations...

module.exports = router;
