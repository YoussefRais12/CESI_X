const express = require('express');
const articleRoute = express.Router();
const Article = require('../models/article');
const Restaurant = require('../models/restaurant');
const isAuth = require("../middleware/passport");
const checkRole = require("../middleware/checkRole");

// Create a new article
articleRoute.post('/add', async (req, res) => {
    const { name, price, description, restaurantId, category } = req.body; // Include category in the request body
    try {
        const newArticle = new Article({ name, price, description, restaurantId, category }); // Add category to the new article
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

// Find articles by IDs
articleRoute.post('/articles/findByIds', async (req, res) => {
    const { ids } = req.body;
    try {
        const articles = await Article.find({ '_id': { $in: ids } });
        res.status(200).json(articles);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update an article by ID
articleRoute.put('/:id', isAuth(), checkRole('restaurantOwner'), async (req, res) => {
    const { id } = req.params;
    const { name, price, description, category } = req.body;
    try {
        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        article.name = name !== undefined ? name : article.name;
        article.price = price !== undefined ? price : article.price;
        article.description = description !== undefined ? description : article.description;
        article.category = category !== undefined ? category : article.category;

        await article.save();
        console.log('Updated article:', article); // Log the updated article
        res.status(200).json(article);
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

module.exports = articleRoute;
