const mongoose = require("mongoose");
const schema = mongoose.Schema;

const restaurantSchema = new schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = Restaurant;
