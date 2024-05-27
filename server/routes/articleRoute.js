const express = require('express');
const articleRoute = express.Router();
const Article = require('../models/article');
const isAuth = require("../middleware/passport");

// Create a new article
articleRoute.post('/', async (req, res) => {
    const { name, price, description, restaurantId } = req.body;
    try {
        const newArticle = new Article({ name, price, description, restaurantId });
        await newArticle.save();
        res.status(201).json(newArticle);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

articleRoute.get('/restaurant/:restaurantId', isAuth(), async (req, res) => {
    const { restaurantId } = req.params;
    try {
        const articles = await Article.findOne({restaurantId});
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: error.message });
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

// Find an article by ID
articleRoute.get('/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    try {
        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.status(200).json(article);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Other CRUD operations...

module.exports = articleRoute;
