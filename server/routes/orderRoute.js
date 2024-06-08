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
        let allArticlesExist = true;
        let totalOrderPrice = 0; 
        const articlesByRestaurant = {};

        for (const item of Articles) {
            const article = await Article.findById(item.articleId);
            if (!article || item.quantity <= 0) {
                allArticlesExist = false;
                break;
            }

            const restaurantId = article.restaurantId;
            const articlePrice = article.price * item.quantity; // Calculate the price for the quantity of the article
            totalOrderPrice += articlePrice;
            if (!articlesByRestaurant[restaurantId]) {
                articlesByRestaurant[restaurantId] = [];
            }

            const newArticle = {
                articleId: article._id, 
                quantity: item.quantity
            };

            articlesByRestaurant[restaurantId].push(newArticle);
        }

        if (allArticlesExist) {
            const orders = [];
            for (const restaurantId in articlesByRestaurant) {
                const articlesWithoutId = articlesByRestaurant[restaurantId].map(article => ({
                    articleId: article.articleId,
                    quantity: article.quantity
                }));

                const order = {
                    restaurantId,
                    Articles: articlesWithoutId
                };

                orders.push(order);
            }

            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Apply a discount if this is the user's first order and they were referred by another user
            if (user.orders.length === 0 && user.referredBy && !user.hasUsedReferral) {
                const discountRate = 0.10; // 10% discount
                totalOrderPrice = totalOrderPrice * (1 - discountRate);
                user.hasUsedReferral = true; // Mark the referral as used
                await user.save();

                // Apply discount to the referrer as well
                const referrer = await User.findById(user.referredBy);
                if (referrer) {
                    referrer.hasUsedReferral = true;
                    await referrer.save();
                }
            }

            const newOrder = new Order({ orderaddress, orderPhone, userId, DeliveryPersonId, Orders: orders, OrderPrice: totalOrderPrice, OrderStatus: "crée" });
            await newOrder.save();

            // Add order for user
            user.orders.push(newOrder._id);
            await user.save();

            // Remove the _id from the order and articles in the response
            const orderWithoutId = JSON.parse(JSON.stringify(newOrder));
            orderWithoutId.Orders.forEach(order => {
                order.Articles.forEach(article => {
                    delete article._id;
                });
                delete order._id;
            });

            res.status(201).json({ message: "Commande ajoutée avec succès", order: orderWithoutId });
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

// Supprimer une commande par ID
orderRoute.delete('/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    try {
      
        const deletedOrder = await Order.findByIdAndDelete(id);
        if (!deletedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

      
        const user = await User.findOneAndUpdate(
            { orders: id }, 
            { $pull: { orders: id } }, 
            { new: true } 
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
// Mettre à jour une commande par ID
orderRoute.put('/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    const { orderaddress, orderPhone, userId, DeliveryPersonId, Orders,OrderStatus } = req.body;
    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.orderaddress = orderaddress !== undefined ? orderaddress : order.orderaddress;
        order.orderPhone = orderPhone !== undefined ? orderPhone : order.orderPhone;
        order.userId = userId !== undefined ? userId : order.userId;
        order.DeliveryPersonId = DeliveryPersonId !== undefined ? DeliveryPersonId : order.DeliveryPersonId;
        order.Orders = Orders !== undefined ? Orders : order.Orders;
        order.OrderPrice = OrderPrice !== undefined ? OrderPrice : order.OrderPrice;
        order.OrderStatus = OrderStatus !== undefined ? OrderStatus : order.OrderStatus;

        await order.save();
        console.log('Updated order:', order);
        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add article in an order by ID
orderRoute.post('/:idorder/article/:idarticle', isAuth(), async (req, res) => {
    const { idorder, idarticle } = req.params;
    const { quantity } = req.body;

    try {
        if (quantity <= 0) {
            throw new Error('Quantity must be greater than zero');
        }

        const article = await Article.findById(idarticle);
        if (!article) {
            throw new Error('Article not found');
        }

        const order = await Order.findById(idorder);
        if (!order) {
            throw new Error('Order not found');
        }

        const articleTotalPrice = article.price * quantity;

        const orderIndex = order.Orders.findIndex(orderItem => 
            orderItem.restaurantId.toString() === article.restaurantId.toString()
        );

        if (orderIndex !== -1) {
            const articleIndex = order.Orders[orderIndex].Articles.findIndex(item => item.articleId.toString() === idarticle);

            if (articleIndex !== -1) {
                order.Orders[orderIndex].Articles[articleIndex].quantity += quantity;
            } else {
                order.Orders[orderIndex].Articles.push({ articleId: idarticle, quantity: quantity });
            }
        } else {
            const newOrder = {
                restaurantId: article.restaurantId,
                Articles: [{ articleId: idarticle, quantity: quantity }]
            };
            order.Orders.push(newOrder);
        }

        order.OrderPrice = (order.OrderPrice || 0) + articleTotalPrice;

        await order.save();

        console.log('Order after update:', order);
        res.status(200).json({ message: 'Article added/updated successfully', order });
    } catch (error) {
        console.error('Error adding/updating article in order:', error);
        res.status(400).json({ error: error.message });
    }
});

// Delete article in an order by ID
orderRoute.delete('/:idorder/article/:idarticle', isAuth(), async (req, res) => {
    const { idorder, idarticle } = req.params;

    try {
        const order = await Order.findById(idorder);
        if (!order) {
            throw new Error('Order not found');
        }

        const orderIndex = order.Orders.findIndex(orderItem => 
            orderItem.Articles.some(article => article.articleId.toString() === idarticle)
        );
        if (orderIndex === -1) {
            throw new Error('Order not found in order');
        }
        const articleIndex = order.Orders[orderIndex].Articles.findIndex(item => item.articleId.toString() === idarticle);
        if (articleIndex === -1) {
            throw new Error('Article not found in order');
        }

        const article = await Article.findById(idarticle);
        if (!article) {
            throw new Error('Article not found');
        }

        const quantity = order.Orders[orderIndex].Articles[articleIndex].quantity;
        const articleTotalPrice = article.price * quantity;

        if (quantity > 1) {
            order.Orders[orderIndex].Articles[articleIndex].quantity--;
            order.OrderPrice = (order.OrderPrice) - article.price;
        } else {
            order.Orders[orderIndex].Articles.splice(articleIndex, 1);
            order.OrderPrice = (order.OrderPrice || 0) - articleTotalPrice;

            if (order.Orders[orderIndex].Articles.length === 0) {
                order.Orders.splice(orderIndex, 1);
            }
        }

        await order.save();

        console.log('Order after update:', order);
        res.status(200).json({ message: 'Article deleted successfully', order });
    } catch (error) {
        console.error('Error deleting article from order:', error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = orderRoute;
