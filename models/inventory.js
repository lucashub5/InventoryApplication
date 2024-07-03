const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const InventorySchema = new Schema({
    owner: { type: String, required: true },
    articles: [{
        article: { type: Schema.Types.ObjectId, ref: "Article", required: true },
        quantity: { type: Number, required: true }
    }]
});

// Virtual for inventory's URL
InventorySchema.virtual("url").get(function () {
    return `/catalog/inventory/${this._id}`;
});

InventorySchema.virtual('number_of_articles').get(function() {
    return this.articles.reduce((total, article) => total + article.quantity, 0);
});

module.exports = mongoose.model("Inventory", InventorySchema, 'inventory');