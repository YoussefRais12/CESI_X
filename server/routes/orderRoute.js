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

orderRoute.post('/add', async (req, res) => {
    const { orderaddress, orderPhone, userId, DeliveryPersonId, Articles } = req.body;

    try {
        // Vérification des articles et des quantités
        let allArticlesExist = true;
        for (const item of Articles) {
            const article = await Article.findById(item.articleId);
            if (!article || item.quantity <= 0) {
                allArticlesExist = false;
                break; // Sortir de la boucle dès qu'un article n'existe pas ou si la quantité est invalide
            }
        }

        if (allArticlesExist) {
            // Tous les articles existent et les quantités sont valides, enregistrer la nouvelle commande
            const newOrder = new Order({ orderaddress, orderPhone, userId, DeliveryPersonId, Articles });
            await newOrder.save();

            // Ajouter la commande à l'utilisateur
            const user = await User.findById(userId);
            if (user) {
                user.orders.push(newOrder._id);
                await user.save();
            } else {
                throw new Error('User not found');
            }

            res.status(201).json({ message: "Commande ajoutée avec succès", order: newOrder });
        } else {
            res.status(400).json({ error: 'At least one of the articles does not exist or has an invalid quantity' });
        }
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
// Add article to an order by ID
orderRoute.post('/:idorder/article/:idarticle', isAuth(), async (req, res) => {
    const { idorder, idarticle } = req.params;

    try {
        const order = await Order.findOneAndUpdate(
            { _id: idorder },
            { $push: { orderarrayArticles: idarticle } },
            { new: true } 
        );

        if (!order) {
            console.error('Order not found');
            throw new Error('Order not found');
        }

        console.log('Order after update:', order);
        res.status(200).json({ message: 'Article added successfully', order });
    } catch (error) {
        console.error('Error adding article to order:', error);
        res.status(400).json({ error: error.message });
    }
});

// Delete article in an order by ID
orderRoute.delete('/:idorder/article/:idarticle', isAuth(), async (req, res) => {
    const { idorder, idarticle } = req.params;

    try {
        const order = await Order.findOneAndUpdate(
            { _id: idorder },
            { $pull: { orderarrayArticles: idarticle } }, 
            { new: true } 
        );

        if (!order) {
            console.error('Order not found or article not associated with this order');
            throw new Error('Order not found or article not associated with this order');
        }

        console.log('Order after update:', order);
        res.status(200).json({ message: 'Article deleted successfully', order });
    } catch (error) {
        console.error('Error deleting article from order:', error);
        res.status(400).json({ error: error.message });
    }
});


module.exports = orderRoute;
