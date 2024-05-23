const mongoose = require("mongoose");
const schema = mongoose.Schema;

const articleSchema = new schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true }
});

const Article = mongoose.model("Article", articleSchema);
module.exports = Article;
