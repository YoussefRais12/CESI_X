const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// import axios from "axios";

const orderSchema = new Schema({
    orderaddress: { type: String, required: true },
    orderPhone: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    DeliveryPersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPerson', required: true },
    Orders: [{
        restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        Articles: [{
            articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
            quantity: { type: Number, required: true }
        }]
    }],
    OrderPrice: { type: Number },
    OrderStatus: { type: String }
});


const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
