const express = require("express");
const Order = require("../models/order");
const isAuth = require("../middleware/passport");
const checkRole = require("../middleware/role-check");
const UserRole = require("../../client/src/type.tsx");

const orderRouter = express.Router();

// Créer une nouvelle commande
/*orderRouter.post("/add", isAuth(), checkRole([UserRole.user, UserRole.admin]), async (req, res) => {
    const { Orderaddress, OrderPhone, OrderId, OrderarrayArticles } = req.body;
    try {
        const newOrder = new Order({
            Orderaddress,
            OrderPhone,
            OrderId,
            OrderarrayArticles
        });

        const savedOrder = await newOrder.save();
        res.status(201).send({ order: savedOrder, msg: "Order created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});*/

// Obtenir toutes les commandes
/*orderRouter.get("/all", isAuth(), checkRole([UserRole.admin]), async (req, res) => {
    try {
        const orders = await Order.find().populate('OrderId').populate('OrderarrayArticles');
        res.status(200).send({ orders, msg: "All orders retrieved successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});*/

// Obtenir une commande par ID
/*orderRouter.get("/find/:id", isAuth(), checkRole([UserRole.user, UserRole.admin]), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('OrderId').populate('OrderarrayArticles');
        if (!order) {
            return res.status(404).send({ msg: "Order not found" });
        }
        res.status(200).send({ order, msg: "Order retrieved successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});*/

// Mettre à jour une commande par ID
/*orderRouter.put("/update/:id", isAuth(), checkRole([UserRole.admin]), async (req, res) => {
    const { Orderaddress, OrderPhone, OrderId, OrderarrayArticles } = req.body;
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { Orderaddress, OrderPhone, OrderId, OrderarrayArticles },
            { new: true }
        );
        if (!updatedOrder) {
            return res.status(404).send({ msg: "Order not found" });
        }
        res.status(200).send({ order: updatedOrder, msg: "Order updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});*/

// Supprimer une commande par ID
/*orderRouter.delete("/delete/:id", isAuth(), checkRole([UserRole.admin]), async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) {
            return res.status(404).send({ msg: "Order not found" });
        }
        res.status(200).send({ msg: "Order deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});*/

// Fonction pour récupérer l'ID de la commande
orderRouter.get("/:id/ownerOrderId", isAuth(), checkRole([UserRole.user, UserRole.admin]), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).send({ msg: "Order not found" });
        }
        const ownerId = order.getOwnerOrderId();
        res.status(200).send({ ownerId, msg: "Owner order ID retrieved successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// Fonction pour récupérer l'adresse de la commande
orderRouter.get("/:id/address", isAuth(), checkRole([UserRole.user, UserRole.admin]), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).send({ msg: "Order not found" });
        }
        const address = order.getAddress();
        res.status(200).send({ address, msg: "Order address retrieved successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// Fonction pour récupérer le téléphone de la commande
orderRouter.get("/:id/phone", isAuth(), checkRole([UserRole.user, UserRole.admin]), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).send({ msg: "Order not found" });
        }
        const phone = order.getPhone();
        res.status(200).send({ phone, msg: "Order phone retrieved successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// Fonction pour récupérer les articles d'une commande
orderRouter.get("/:id/articles", isAuth(), checkRole([UserRole.user, UserRole.admin]), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('OrderarrayArticles');
        if (!order) {
            return res.status(404).send({ msg: "Order not found" });
        }
        const articles = order.getOrderarrayArticles();
        res.status(200).send({ articles, msg: "Order articles retrieved successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = orderRouter;