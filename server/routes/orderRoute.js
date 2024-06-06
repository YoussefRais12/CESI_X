const express = require('express');
const orderRoute = express.Router();
const Order = require('../models/Order');
const User = require('../models/user');
const Article = require('../models/article');
const isAuth = require("../middleware/passport");
const checkRole = require("../middleware/checkRole");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create a new Order
orderRoute.post('/add', async (req, res) => {
    const { orderaddress, orderPhone, userId, DeliveryPersonId, orderarrayArticles } = req.body; // Include category in the request body
    try {
        const newOrder = new Order({ orderaddress, orderPhone, userId, DeliveryPersonId, orderarrayArticles }); // Add category to the new order
        let allArticlesExist = true;
        for (const articleId of orderarrayArticles) {
            const article = await Article.findById(articleId);
            if (!article) {
                allArticlesExist = false;
                break; // Sortir de la boucle dès qu'un article n'existe pas
            }
        }
        if (allArticlesExist) {
            await newOrder.save();
        }else{
            res.status(400).json({ error: 'At least one of the articles does not exist' });
        }
        // Add the order to the order array for user
        const user = await User.findById(userId);
        if (user) {
            user.orders.push(newOrder._id);
            await user.save();
        } else {
            throw new Error('User not found');
        }
        
        res.status(201).json("commande ajouté");
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Get a order by ID
orderRoute.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an order by ID
orderRoute.delete('/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    try {
        // Supprimer la commande de la collection Order
        const deletedOrder = await Order.findByIdAndDelete(id);
        if (!deletedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Supprimer la commande de la liste d'ordres de l'utilisateur
        const user = await User.findOneAndUpdate(
            { orders: id }, // Recherche de l'utilisateur ayant cette commande
            { $pull: { orders: id } }, // Supprimer l'ID de commande du tableau d'ordres de l'utilisateur
            { new: true } // Retourner l'utilisateur mis à jour après la modification
        );

        if (!user) {
            console.error('User not found');
            throw new Error('User not found or order not associated with user');
        }

        console.log('User after update:', user);

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(400).json({ error: error.message });
    }
});
// Update an order by ID
orderRoute.put('/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    const { orderaddress, orderPhone, userId, DeliveryPersonId, orderarrayArticles } = req.body;
    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ error: 'order not found' });
        }

        order.orderaddress = orderaddress !== undefined ? orderaddress : order.orderaddress;
        order.orderPhone = orderPhone !== undefined ? orderPhone : order.orderPhone;
        order.userId = userId !== undefined ? userId : order.userId;
        order.DeliveryPersonId = DeliveryPersonId !== undefined ? DeliveryPersonId : order.DeliveryPersonId;
        order.orderarrayArticles = orderarrayArticles !== undefined ? orderarrayArticles : order.orderarrayArticles;

        await order.save();
        console.log('Updated order:', order);
        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});




module.exports = orderRoute;
