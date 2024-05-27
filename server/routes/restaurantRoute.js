const express = require('express');
const menuRoute = express.Router();
const restaurantRoute = express.Router();
const Menu = require('../models/menu');
const Restaurant = require('../models/restaurant');
const Article = require('../models/article');
const isAuth = require("../middleware/passport");

// Create a new menu
menuRoute.post('/', isAuth(), async (req, res) => {
    const { name, price, description, articles, restaurantId } = req.body;
    try {
        // Verify that the restaurant exists
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(400).json({ error: "Restaurant not found" });
        }

        // Verify that all articles exist
        for (const articleId of articles) {
            const article = await Article.findById(articleId);
            if (!article) {
                return res.status(400).json({ error: `Article with ID ${articleId} not found` });
            }
        }

        const newMenu = new Menu({ name, price, description, articles, restaurantId });
        await newMenu.save();

        // Add the menu to the restaurant's menus array
        restaurant.menus.push(newMenu._id);
        await restaurant.save();

        res.status(201).json(newMenu);
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

module.exports = menuRoute;
