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

// **************************************************************** Instance methods **************************************************************** //
orderSchema.methods.getOwnerOrderId = function() {
    return this._id;
};
orderSchema.methods.getAddress = function() {
    return this.orderaddress;
};
orderSchema.methods.getDescription = function() {
    return this.orderPhone;
};
orderSchema.methods.getOrderArrayArticles = function() {
    return this.Orders.flatMap(order => order.Articles);
};
orderSchema.methods.getOrderPrice = function() {
    return this.OrderPrice;
};
orderSchema.methods.getOrderStatus = function() {
    return this.OrderStatus;
};
//  **************************************************************** models Route  **************************************************************** //
// Méthode statique pour ajouter une commande en utilisant une route externe
orderSchema.statics.addOrderUsingRoute = async function(orderData) {
    try {
        const apiurl = process.env.REACT_APP_API_URL;
        const { orderaddress, orderPhone, userId, DeliveryPersonId, Orders } = orderData;

        const Articles = Orders.flatMap(order =>
            order.Articles.map(article => ({
                articleId: article.articleId,
                quantity: article.quantity
            }))
        );

        const requestData = {
            orderaddress,
            orderPhone,
            userId,
            DeliveryPersonId,
            Articles
        };

        const result = await axios.post(`${apiurl}/order/add`, requestData, {
            headers: {
                Authorization: localStorage.getItem("token"),
            },
        });

        return result.data; // Assurez-vous que le résultat renvoyé contient Orderprice
    } catch (error) {
        console.log(error);
        throw error;
    }
};
// add Article in order
orderSchema.methods.addArticle = async function(articleId, quantity) {
    try {
        const apiurl = process.env.REACT_APP_API_URL;
        const requestData = {
            quantity
        };
        const result = await axios.post(`${apiurl}/order/article/${articleId}`, requestData, {
            headers: {
                Authorization: localStorage.getItem("token"),
            },
        });
        console.log(result)
        // Mettre à jour le prix total de la commande
        this.OrderPrice = result.Orderprice;
        return this;
    } catch (error) {
        console.error('Error adding article to order:', error);
        throw error;
    }
};

// delete Article in order
orderSchema.methods.deleteArticle = async function(articleId) {
    try {
        const apiurl = process.env.REACT_APP_API_URL;
   
        const result = await axios.delete(`${apiurl}/order/article/${articleId}`, {
            headers: {
                Authorization: localStorage.getItem("token"),
            },
        });
        console.log(result)
        // Mettre à jour le prix total de la commande
        this.OrderPrice = result.Orderprice;
        return this;
    } catch (error) {
        console.error('Error adding article to order:', error);
        throw error;
    }
};

//  **************************************************************** Constructeur de l'objet **************************************************************** //
orderSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const result = await this.constructor.addOrderUsingRoute(this.toObject());
            this.OrderPrice = result.OrderPrice;
            console.log(result.OrderPrice)
        } catch (error) {
            return next(error);
        }
    }
    next();
});

orderSchema.pre('remove', async function(next) {
    try {
        const apiurl = process.env.REACT_APP_API_URL;
   
        const result = await axios.delete(`${apiurl}/order/${this._id}`, {
            headers: {
                Authorization: localStorage.getItem("token"),
            },
        });

        console.log(result);
        next();
    } catch (error) {
        console.error('Error deleting order:', error);
        throw error;
    }
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
