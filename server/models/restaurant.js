const mongoose = require("mongoose");
const schema = mongoose.Schema;
const articleRoutes = require('../routes/articleRoute');

const restaurantSchema = new schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    articles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }], // Array of article references
    menus: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }] // Array of menu references
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = Restaurant;

//fonction pour recup le nom du restaurant
restaurantSchema.methods.getName = function() {
    return this.name;
};
//fonction pour recup l'address du restaurant
restaurantSchema.methods.getAddress = function() {
    return this.address;
};
//fonction pour recup le téléphone du restaurant
restaurantSchema.methods.getdescription = function() {
    return this.phone;
};
//fonction pour recup l'email du restaurant
restaurantSchema.methods.getEmail = function() {
    return this.email;
};
//fonction pour recup l'ownerId du restaurant
restaurantSchema.methods.getOwnerId = function() {
    return this.ownerId;
};
/* fonction pour crée un article 
restaurantSchema.statics.Addarticle = async function(restaurantId) {
    try {
        const articles = await articleRoutes.findByRestaurantId(restaurantId);
        return articles;
    } catch (error) {
        throw new Error(error.message);
    }
};*/