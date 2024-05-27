const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const OrderSchema = new Schema({
    Orderaddress: { type: String, required: true },
    OrderPhone: { type: String, required: true },
    OrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    OrderarrayArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true }]
});

const Order = mongoose.model("Order", OrderSchema);
module.exports = Restaurant;

//fonction pour recup l'id de la commande
OrderSchema.methods.getOwnerOrderId = function() {
    return this.OrderId;
};
//fonction pour recup l'address du restaurant
OrderSchema.methods.getAddress = function() {
    return this.Orderaddress;
};
//fonction pour recup le téléphone de la commander
OrderSchema.methods.getdescription = function() {
    return this.OrderPhone;
};
//fonction pour recup les articles d'une commande (return array)
OrderSchema.methods.getOrderarrayArticles = function() {
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