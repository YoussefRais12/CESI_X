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

// Delete an article by ID
router.delete('/:id', async (req, res) => {
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

// Other CRUD operations...

module.exports = router;
