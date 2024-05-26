const mongoose = require("mongoose");
const schema = mongoose.Schema;
const articleRoutes = require('../routes/articleRoute');

const articleSchema = new schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true }
});

const Article = mongoose.model("Article", articleSchema);
module.exports = Article;

//fonction pour recup le nom de l'article
articleSchema.methods.getName = function() {
    return this.name;
};
//fonction pour recup le prix de l'article
articleSchema.methods.getPrice = function() {
    return this.price;
};
//fonction pour recup la description  de l'article
articleSchema.methods.getdescription = function() {
    return this.description;
};
//fonction pour recup le restaurantId de l'article
articleSchema.methods.getrestaurantId = function() {
    return this.restaurantId;
};
/* fonction pour trouver les infos de l'article en lui même
articleSchema.statics.findByRestaurantId = async function(restaurantId) {
    try {
        const articles = await articleRoutes.findByRestaurantId(restaurantId);
        return articles;
    } catch (error) {
        throw new Error(error.message);
    }
};*/