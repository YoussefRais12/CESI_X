const express = require('express');
const router = express.Router();
const DeliveryPerson = require('../models/delivery-person');
const User = require('../models/user');
const isAuth = require("../middleware/passport");


// Create a new delivery person
router.post('/', async (req, res) => {
    const { userId, vehicleDetails } = req.body;
    try {
        const newDeliveryPerson = new DeliveryPerson({ userId, vehicleDetails });
        await newDeliveryPerson.save();
        res.status(201).json(newDeliveryPerson);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all delivery persons
//--------------------------------
// N'oubliez pas de protéger cette route avec le middleware isAuth
//--------------------------------
router.get('/all', isAuth(), async (req, res) => {
    try {
        const deliveryPersons = await DeliveryPerson.find().populate('userId', 'name email phone');
        res.status(200).json(deliveryPersons);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get a delivery person by ID
router.get('/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    try {
        const deliveryPerson = await DeliveryPerson.findById(id).populate('userId', 'name email phone');
        if (!deliveryPerson) return res.status(404).json({ message: "Delivery person not found" });
        res.status(200).json(deliveryPerson);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a delivery person
router.put('/update/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    const { vehicleDetails, available } = req.body;
    try {
        const deliveryPerson = await DeliveryPerson.findByIdAndUpdate(id, { vehicleDetails, available }, { new: true }).populate('userId', 'name email phone');
        if (!deliveryPerson) return res.status(404).json({ message: "Delivery person not found" });
        res.status(200).json(deliveryPerson);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a delivery person
router.delete('/delete/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    try {
        const deliveryPerson = await DeliveryPerson.findByIdAndDelete(id);
        if (!deliveryPerson) return res.status(404).json({ message: "Delivery person not found" });
        res.status(200).json({ message: "Delivery person deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
