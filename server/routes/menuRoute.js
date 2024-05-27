const express = require('express');
const menuRoute = express.Router();
const Menu = require('../models/menu');
const Article = require('../models/article');
const Restaurant = require('../models/restaurant');
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

        res.status(201).json(newMenu);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all menus for a specific restaurant
menuRoute.get('/restaurant/:restaurantId', isAuth(), async (req, res) => {
    const { restaurantId } = req.params;
    try {
        const menus = await Menu.find({ restaurantId }).populate('articles');
        res.status(200).json(menus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a menu by ID
menuRoute.get('/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    try {
        const menu = await Menu.findById(id).populate('articles');
        if (!menu) {
            return res.status(404).json({ error: "Menu not found" });
        }
        res.status(200).json(menu);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a menu by ID
menuRoute.put('/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    const { name, price, description, articles, restaurantId } = req.body;
    try {
        const menu = await Menu.findById(id);
        if (!menu) {
            return res.status(404).json({ error: "Menu not found" });
        }

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

        menu.name = name;
        menu.price = price;
        menu.description = description;
        menu.articles = articles;
        menu.restaurantId = restaurantId;

        await menu.save();

        res.status(200).json(menu);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a menu by ID
menuRoute.delete('/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    try {
        const menu = await Menu.findByIdAndDelete(id);
        if (!menu) {
            return res.status(404).json({ error: "Menu not found" });
        }
        res.status(200).json({ message: "Menu deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = menuRoute;
