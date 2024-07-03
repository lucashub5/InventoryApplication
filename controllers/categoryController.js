const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const Article = require("../models/article")
const { body, validationResult } = require('express-validator');

exports.index = asyncHandler(async (req, res, next) => {
    res.render("index", {
        title: "Home",
    });
})

exports.category_list = asyncHandler(async (req, res, next) => {
    const allCategories = await Category.find().sort({ name: 1 }).exec();
    res.render("category_list", {
        title: "Category List",
        category_list: allCategories,
    });
});

exports.category_detail = asyncHandler(async (req, res, next) => {
    const [category, AllArticleByCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Article.find({ category: req.params.id }, "name shortDescription price stock_number").exec(),
    ])

    if (category === null) {
        const err = new Error("Category not found");
        err.status = 404;
        return next(err);
    }

    res.render("category_detail", {
        title: "Category Detail",
        category: category,
        category_articles: AllArticleByCategory,
    })
})

exports.category_create_get = asyncHandler(async (req, res, next) => {
    res.render("category_form", {
        title: "Create Category",
    });
})

exports.category_create_post = [
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Name must be specified.'),
    body('description').trim().isLength({ min: 1 }).escape().withMessage('Description must be specified.'),
    body('examples').trim().isLength({ min: 1 }).escape().withMessage('Examples must be specified.'),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const category = new Category({
            name: req.body.name,
            description: req.body.description,
            examples: req.body.examples,
        });

        if (!errors.isEmpty()) {
            res.render("category_form", {
                title: "Create Category",
                category: category,
                errors: errors.array(),
            });
            return;
        } else {
            await category.save();
            res.redirect(category.url);
        }
    })
];

exports.category_delete_get = asyncHandler(async (req, res, next) => {
    const [category, allArticleByCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Article.find({ category: req.params.id }, "name shortDescription price stock_number").exec(),
    ])

    if (category === null) {
        res.redirect("/catalog/category");
    }

    res.render("category_delete", {
        title: "Delete Category",
        category: category,
        category_articles: allArticleByCategory,
    });
})

exports.category_delete_post = asyncHandler(async (req, res, next) => {
    const [category, allArticleByCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Article.find({ category: req.params.id }, "name shortDescription price stock_number").exec(),
    ])

    if (allArticleByCategory.length > 0) {
        res.render("category_delete", {
        title: "Delete Category",
        category: category,
        category_articles: allArticleByCategory,
    });
        return;
    } else {
        await Category.findByIdAndDelete(req.body.categoryid);
        res.redirect("/catalog/category");
    }
})

exports.category_update_get = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id).exec();
    
    if (category === null) {
        const err = new Error("Category not found");
        err.status = 404;
        return next(err);
    }
    
    res.render("category_form", {
        title: "Update Category",
        category: category,
    });
})

exports.category_update_post = [
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Name must be specified.'),
    body('description').trim().isLength({ min: 1 }).escape().withMessage('Description must be specified.'),
    body('examples').trim().isLength({ min: 1 }).escape().withMessage('Examples must be specified.'),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const category = new Category({
            name: req.body.name,
            description: req.body.description,
            examples: req.body.examples,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            res.render("category_form", {
                title: "Create Category",
                category: category,
                errors: errors.array(),
            });
            return;
        } else {
            const updatedCategory = await Category.findByIdAndUpdate(req.params.id, category, {});
            res.redirect(updatedCategory.url);
        }
    })
];