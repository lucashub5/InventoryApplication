const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
    name: { type: String, required: true, maxLength : 30 },
    shortDescription: { type: String, required: true, maxLength: 40 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true },
    stock_number: { type: Number, required: true },
    detailDescription: { type: String, required: true, maxLength: 200 },
});

// Virtual for article's URL
ArticleSchema.virtual("url").get(function () {
    return `/catalog/article/${this._id}`;
});

module.exports = mongoose.model("Article", ArticleSchema, 'article');