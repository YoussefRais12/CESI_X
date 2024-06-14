const express = require('express');
const orderRoute = express.Router();
const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');
const User = require('../models/user');
const Article = require('../models/article');
const Restaurant = require('../models/restaurant');
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
            const articlePrice = article.price * item.quantity;
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
            const subOrders = [];
            for (const restaurantId in articlesByRestaurant) {
                const articles = articlesByRestaurant[restaurantId];
                let subOrderPrice = 0;
                for (const article of articles) {
                    const articleData = await Article.findById(article.articleId);
                    subOrderPrice += articleData.price * article.quantity;
                }

                const subOrder = new SubOrder({
                    restaurantId,
                    Articles: articles,
                    OrderPrice: subOrderPrice,
                    OrderStatus: "en cours"
                });

                await subOrder.save();

                // Add subOrder to the corresponding restaurant
                const restaurant = await Restaurant.findById(restaurantId);
                restaurant.subOrders.push(subOrder._id);
                await restaurant.save();

                subOrders.push(subOrder);
            }

            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            if (user.orders.length === 0 && user.referredBy && !user.hasUsedReferral) {
                const discountRate = 0.10;
                totalOrderPrice = totalOrderPrice * (1 - discountRate);
                user.hasUsedReferral = true;
                await user.save();

                const referrer = await User.findById(user.referredBy);
                if (referrer) {
                    referrer.hasUsedReferral = true;
                    await referrer.save();
                }
            }

            const newOrder = new Order({
                orderaddress,
                orderPhone,
                userId,
                DeliveryPersonId,
                Orders: subOrders.map(subOrder => ({
                    subOrderId: subOrder._id,
                    restaurantId: subOrder.restaurantId,
                    OrderPrice: subOrder.OrderPrice,
                    OrderStatus: subOrder.OrderStatus,
                    Articles: subOrder.Articles // Include the articles
                })),
                OrderPrice: totalOrderPrice,
                OrderStatus: "en cours"
            });

            await newOrder.save();

            user.orders.push(newOrder._id);
            await user.save();

            // Transform the order to include sub-order details
            const orderWithDetails = await Order.findById(newOrder._id)
                .populate({
                    path: 'Orders.subOrderId',
                    populate: {
                        path: 'Articles.articleId',
                        model: 'Article'
                    }
                })
                .lean();

            res.status(201).json({ message: "Commande ajoutée avec succès", order: orderWithDetails });
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
    const { orderaddress, orderPhone, userId, DeliveryPersonId, Orders, OrderStatus } = req.body;
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

// Mettre à jour le status
orderRoute.put('/:id/status', isAuth(), async (req, res) => {
    const { id } = req.params;
    const { OrderStatus } = req.body;
    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
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
        const restaurantId = article.restaurantId;

        const orderIndex = order.Orders.findIndex(orderItem =>
            orderItem.restaurantId.toString() === restaurantId.toString()
        );

        if (orderIndex !== -1) {
            const articleIndex = order.Orders[orderIndex].Articles.findIndex(item => item.articleId.toString() === idarticle);

            if (articleIndex !== -1) {
                order.Orders[orderIndex].Articles[articleIndex].quantity += quantity;
            } else {
                order.Orders[orderIndex].Articles.push({ articleId: idarticle, quantity: quantity });
            }

            // Update the OrderPrice of the subOrder
            order.Orders[orderIndex].OrderPrice += articleTotalPrice;
        } else {
            // Create a new subOrder
            const newSubOrder = new SubOrder({
                restaurantId,
                Articles: [{ articleId: idarticle, quantity: quantity }],
                OrderPrice: articleTotalPrice,
                OrderStatus: "en cours"
            });

            await newSubOrder.save();

            const newOrder = {
                subOrderId: newSubOrder._id,
                restaurantId: restaurantId,
                Articles: newSubOrder.Articles,
                OrderPrice: newSubOrder.OrderPrice,
                OrderStatus: newSubOrder.OrderStatus
            };
            order.Orders.push(newOrder);
        }

        order.OrderPrice = (order.OrderPrice || 0) + articleTotalPrice;

        await order.save();

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
