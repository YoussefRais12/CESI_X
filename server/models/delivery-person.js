const mongoose = require("mongoose");
const schema = mongoose.Schema;

const deliveryPersonSchema = new schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleDetails: { type: String, required: true },
    available: { type: Boolean, default: true }
});

const DeliveryPerson = mongoose.model("DeliveryPerson", deliveryPersonSchema);
module.exports = DeliveryPerson;
