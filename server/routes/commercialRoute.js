const express = require("express");
const Client = require("../models/client"); // Assuming there is a Client model for client accounts
const Order = require("../models/order"); // Assuming there is an Order model for orders
const commercialRouter = express.Router();
const isAuth = require("../middleware/passport");
const checkRole = require("../middleware/role-check"); // Assuming a middleware to check roles
const UserRole = require("../../client/src/type.tsx");
const { Server } = require("socket.io");
const io = new Server();

require("dotenv").config();

// Consulter des comptes clients
commercialRouter.get("/clients", isAuth(), checkRole([UserRole.commercial]), async (req, res) => {
    try {
        const clients = await Client.find();
        res.send({ clients, msg: "All clients" });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

// Suspendre un compte client
commercialRouter.put("/clients/suspend/:id", isAuth(), checkRole([UserRole.commercial]), async (req, res) => {
    try {
        const client = await Client.findByIdAndUpdate(req.params.id, { suspended: true }, { new: true });
        res.send({ client, msg: "Client suspended" });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

// Modifier un compte client
commercialRouter.put("/clients/update/:id", isAuth(), checkRole([UserRole.commercial]), async (req, res) => {
    try {
        const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send({ client: updatedClient, msg: "Client updated" });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

// Supprimer un compte client
commercialRouter.delete("/clients/delete/:id", isAuth(), checkRole([UserRole.commercial]), async (req, res) => {
    try {
        await Client.findByIdAndDelete(req.params.id);
        res.send({ msg: "Client deleted" });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

// Tableau de bord en temps réel
commercialRouter.get("/dashboard", isAuth(), checkRole([UserRole.commercial]), async (req, res) => {
    try {
        // Example of fetching order statistics
        const orderStats = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$amount" }
                }
            }
        ]);

        res.send({ dashboard: orderStats, msg: "Dashboard data" });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

// Notifications en temps réel via WebSocket
io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });

    // Example of sending a notification
    socket.on("notify", (msg) => {
        io.emit("notification", msg);
    });
});

module.exports = { commercialRouter, io };