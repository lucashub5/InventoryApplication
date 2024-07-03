const Article = require("../models/article");
const asyncHandler = require("express-async-handler");
const Category = require("../models/category");
const { body, validationResult } = require('express-validator');
const Inventory = require("../models/inventory");

exports.article_detail = asyncHandler(async (req, res, next) => {
    const [article, allInventories] = await Promise.all([
        Article.findById(req.params.id).exec(),
        Inventory.find().exec(),
    ]);

    const inventory_owners = allInventories.map(inventory => inventory.owner)

    res.render("article_detail", {
        title: "Article Detail",
        article: article,
        inventory_owners: inventory_owners, 
    });
})

exports.article_create_get = asyncHandler(async (req, res, next) => {
    const categories = await Category.find().exec();
    res.render("article_form", {
        title: "Create Article",
        categories: categories,
    });
})

exports.article_create_post = [
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Name must be specified.'),
    body('short_description').trim().isLength({ min: 1 }).escape().withMessage('Short description must be specified.'),
    body('category').trim().isLength({ min: 1 }).escape().withMessage('Category must be specified.'),
    body('price').isFloat({ min: 0.01 }).withMessage('Price must be a positive number.'),
    body('stock_number').isInt({ min: 0 }).withMessage('Stock number must be a non-negative integer.'),
    body('detail_description').trim().isLength({ min: 1 }).escape().withMessage('Detail description must be specified.'),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const article = new Article({
            name: req.body.name,
            shortDescription: req.body.short_description,
            category: req.body.category,
            price: req.body.price,
            stock_number: req.body.stock_number,
            detailDescription: req.body.detail_description
        });

        if (!errors.isEmpty()) {
            res.render("article_form", {
                title: "Create Article",
                article: article,
                categories: await Category.find().exec(),
                errors: errors.array(),
            });
            return;
        } else {
            await article.save();
            res.redirect(article.url);
        }
    })
];

exports.article_delete_get = asyncHandler(async (req, res, next) => {
    const [article, allInventoriesByArticle] = await Promise.all([
        Article.findById(req.params.id).exec(),
        Inventory.find({ "articles.article": req.params.id }, "owner").exec(),
    ]);

    if (article === null) {
        res.redirect("/catalog/article");
    }

    res.render("article_delete", {
        title: "Delete Article",
        article: article,
        article_inventories: allInventoriesByArticle,
    });
})

exports.article_delete_post = asyncHandler(async (req, res, next) => {
    const [article, allInventoriesByArticle] = await Promise.all([
        Article.findById(req.params.id).exec(),
        Inventory.find({ "articles.article": req.params.id }, "owner").exec(),
    ]);

    if (allInventoriesByArticle.length > 0) {
        res.render("article_delete", {
        title: "Delete Article",
        article: article,
        article_inventories: allInventoriesByArticle,
        });
        return;
    } else {
        await Article.findByIdAndDelete(req.body.articleid);
        res.redirect("/catalog/category");
    }
})

exports.article_update_get = asyncHandler(async (req, res, next) => {
    const [article, categories] = await Promise.all([
        Article.findById(req.params.id).exec(),
        Category.find().exec(),
    ]);
    
    if (article === null) {
        const err = new Error("Article not found");
        err.status = 404;
        return next(err);
    }
    
    res.render("article_form", {
        title: "Update Article",
        categories: categories,
        article: article,
    });
})

exports.article_update_post = [
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Name must be specified.'),
    body('short_description').trim().isLength({ min: 1 }).escape().withMessage('Short description must be specified.'),
    body('category').trim().isLength({ min: 1 }).escape().withMessage('Category must be specified.'),
    body('price').isFloat({ min: 0.01 }).withMessage('Price must be a positive number.'),
    body('stock_number').isInt({ min: 0 }).withMessage('Stock number must be a non-negative integer.'),
    body('detail_description').trim().isLength({ min: 1 }).escape().withMessage('Detail description must be specified.'),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const article = new Article({
            name: req.body.name,
            shortDescription: req.body.short_description,
            category: req.body.category,
            price: req.body.price,
            stock_number: req.body.stock_number,
            detailDescription: req.body.detail_description,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            res.render("article_form", {
                title: "Create Article",
                article: article,
                categories: await Category.find().exec(),
                errors: errors.array(),
            });
            return;
        } else {
            const updatedArticle = await Article.findByIdAndUpdate(req.params.id, article, {});
            res.redirect(updatedArticle.url);
        }
    })
];

exports.article_add_inventory_post = [
    body('owner').trim().escape(),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a positive integer'),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { owner, quantity } = req.body;

        const article = await Article.findById(req.params.id).exec();

        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        if (article.stock_number < quantity) {
            return res.status(400).json({ message: "Insufficient stock" });
        }

        let inventory = await Inventory.findOne({ owner: owner }).exec();

        if (!inventory) {
            inventory = new Inventory({
                owner: owner,
                articles: []
            });
        }

        const existingArticle = inventory.articles.find(item => item.article.equals(req.params.id));

        if (existingArticle) {
            existingArticle.quantity += quantity;
        } else {
            inventory.articles.push({
                article: req.params.id,
                quantity: quantity
            });
        }

        article.stock_number -= quantity;
        await article.save();
    
        await inventory.save();

        res.redirect(`/catalog/article/${req.params.id}`);
    })
];