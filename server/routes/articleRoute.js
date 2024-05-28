const express = require('express');
const articleRoute = express.Router();
const Article = require('../models/article');
const Restaurant = require('../models/restaurant');
const isAuth = require("../middleware/passport");

// Create a new article
articleRoute.post('/add', async (req, res) => {
    const { name, price, description, restaurantId } = req.body;
    try {
        const newArticle = new Article({ name, price, description, restaurantId });
        await newArticle.save();

        // Add the article to the restaurant's articles array
        const restaurant = await Restaurant.findById(restaurantId);
        restaurant.articles.push(newArticle._id);
        await restaurant.save();

        res.status(201).json(newArticle);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete an article by ID
articleRoute.delete('/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    try {
        const article = await Article.findByIdAndDelete(id);
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.status(200).json({ message: 'Article deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Find an article by name
articleRoute.get('/name/:name', isAuth(), async (req, res) => {
    const { name } = req.params;
    try {
        const article = await Article.findOne({ name });
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.status(200).json(article);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update an article by ID
articleRoute.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, description, restaurantId } = req.body;
    try {
        const updatedArticle = await Article.findByIdAndUpdate(
            id,
            { name, price, description, restaurantId },
            { new: true, runValidators: true }
        );
        if (!updatedArticle) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.status(200).json(updatedArticle);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Other CRUD operations...

module.exports = articleRoute;
