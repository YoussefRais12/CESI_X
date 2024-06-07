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
        const articlesByRestaurant = {};

        for (const item of Articles) {
            const article = await Article.findById(item.articleId);
            console.log(article)
            if (!article || item.quantity <= 0) {
                allArticlesExist = false;
                break;
            }

            const restaurantId = article.restaurantId;

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

            const newOrder = new Order({ orderaddress, orderPhone, userId, DeliveryPersonId, Orders: orders, OrderStatus:"crée" });
            await newOrder.save();

            // add order for  user
            const user = await User.findById(userId);
            if (user) {
                user.orders.push(newOrder._id);
                await user.save();
            } else {
                throw new Error('User not found');
            }

            // Supprimer les _id de la commande et des articles dans la réponse
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
        order.OrderStatus = OrderStatus !== undefined ? OrderStatus : order.OrderStatus;

        await order.save();
        console.log('Updated order:', order);
        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add or update article in an order by ID
orderRoute.post('/:idorder/article/:idarticle', isAuth(), async (req, res) => {
    const { idorder, idarticle } = req.params;
    const { quantity } = req.body;

    try {
        // Vérifiez que la quantité est valide
        if (quantity <= 0) {
            throw new Error('Quantity must be greater than zero');
        }

        // Vérifiez que l'article existe
        const article = await Article.findById(idarticle);
        if (!article) {
            throw new Error('Article not found');
        }

        // Recherchez la commande et vérifiez si l'article existe déjà
        const order = await Order.findById(idorder);
        if (!order) {
            throw new Error('Order not found');
        }

        // Recherchez l'index de la commande dans le tableau Orders
        const orderIndex = order.Orders.findIndex(order => order.restaurantId.toString() === idarticle);
        if (orderIndex === -1) {
            throw new Error('Order not found in order');
        }

        // Recherchez l'index de l'article dans le tableau Articles de la commande
        const articleIndex = order.Orders[orderIndex].Articles.findIndex(item => item.articleId.toString() === idarticle);

        if (articleIndex !== -1) {
            // Si l'article existe déjà, incrémentez la quantité
            order.Orders[orderIndex].Articles[articleIndex].quantity += quantity;
        } else {
            // Sinon, ajoutez le nouvel article avec la quantité spécifiée
            order.Orders[orderIndex].Articles.push({ articleId: idarticle, quantity: quantity });
        }

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
        // Recherchez la commande
        const order = await Order.findById(idorder);
        if (!order) {
            throw new Error('Order not found');
        }

        // Recherchez l'index de la commande dans le tableau Orders
        const orderIndex = order.Orders.findIndex(order => order.Articles.some(article => article.articleId.toString() === idarticle));
        console.log(orderIndex)
        if (orderIndex === -1) {
            throw new Error('Order not found in order');
        }

        // Recherchez l'index de l'article dans le tableau Articles de la commande
        const articleIndex = order.Orders[orderIndex].Articles.findIndex(item => item.articleId.toString() === idarticle);

        if (articleIndex === -1) {
            throw new Error('Article not found in order');
        }

        // Diminuez la quantité de l'article de 1 s'il est supérieur à 1
        if (order.Orders[orderIndex].Articles[articleIndex].quantity > 1) {
            order.Orders[orderIndex].Articles[articleIndex].quantity--;
        } else {
            // Si la quantité est égale à 1, supprimez complètement l'article
            order.Orders[orderIndex].Articles.splice(articleIndex, 1);
        }

        // Enregistrez les modifications de la commande
        await order.save();

        console.log('Order after update:', order);
        res.status(200).json({ message: 'Article deleted successfully', order });
    } catch (error) {
        console.error('Error deleting article from order:', error);
        res.status(400).json({ error: error.message });
    }
});


module.exports = orderRoute;
