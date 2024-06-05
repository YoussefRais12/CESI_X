const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const orderSchema = new Schema({
    orderaddress: { type: String, required: true },
    orderPhone: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderarrayArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true }]
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;

//fonction pour recup l'id de la commande
orderSchema.methods.getOwnerorderId = function() {
    return this.OrderId;
};
//fonction pour recup l'address du restaurant
orderSchema.methods.getAddress = function() {
    return this.orderaddress;
};
//fonction pour recup le téléphone de la commander
orderSchema.methods.getdescription = function() {
    return this.OrderPhone;
};
//fonction pour recup les articles d'une commande (return array)
orderSchema.methods.getOrderarrayArticles = function() {
    return this.OrderarrayArticles;
};
/* fonction pour crée un article 
OrderSchema.statics.Addarticle = async function(restaurantId) {
    try {
        const articles = await articleRoutes.findByRestaurantId(restaurantId);
        return articles;
    } catch (error) {
        throw new Error(error.message);
    }
};*/