const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    orderaddress: { type: String, required: true },
    orderPhone: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    DeliveryPersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPerson', required: true },
    Orders: [{
        subOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubOrder', required: true },
        restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        OrderPrice: { type: Number, required: true },
        OrderStatus: { type: String, required: true }
    }],
    OrderPrice: { type: Number },
    OrderStatus: { type: String }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
