const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const orderSchema = new Schema({
    orderaddress: { type: String, required: true },
    orderPhone: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    DeliveryPersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPerson', required: true },
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
//fonction pour recup le DeliveryPersonId
orderSchema.methods.getDeliveryPersonId = function() {
    return this.DeliveryPersonId;
};
//fonction pour ajouter un article dans la commande 
orderSchema.methods.Addarticle = async function(articleId) {
    this.orderarrayArticles.push(articleId);
    await this.save();
};