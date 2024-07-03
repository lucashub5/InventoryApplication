const Inventory = require("../models/inventory");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require('express-validator');

exports.inventory_list = asyncHandler(async (req, res, next) => {
    const inventories = await Inventory.find().sort({ owner: 1 }).populate('articles.article').exec();

    if (inventories === null) {
        const err = new Error("Inventory not found");
        err.status = 404;
        return next(err);
    }

    inventories.forEach(inventory => {
        let total_amount = 0;
        inventory.articles.forEach(item => {
            total_amount += item.article.price * item.quantity;
        });
        inventory.total_amount = total_amount;
    });

    res.render("inventory_list", {
        title: "Inventory List",
        inventory_list: inventories,
    })
});

exports.inventory_detail = asyncHandler(async (req, res, next) => {
    const inventory = await Inventory.findById(req.params.id).populate('articles.article').exec();

    if (inventory === null) {
        const err = new Error("Inventory not found");
        err.status = 404;
        return next(err);
    }

    res.render("inventory_detail", {
        title: "Inventory Detail",
        inventory: inventory,
    })
})

exports.inventory_create_get = asyncHandler(async (req, res, next) => {
    res.render("inventory_form", {
        title: "Create Inventory",
    });
});

exports.inventory_create_post = [
    body('owner').trim().isLength({ min: 1 }).escape().withMessage('Owner must be specified.'),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const inventory = new Inventory({
            owner: req.body.owner,
            articles: [],
        });

        if (!errors.isEmpty()) {
            res.render("inventory_form", {
                title: "Create Inventory",
                inventory: inventory,
                errors: errors.array(),
            });
            return;
        } else {
            await inventory.save();
            res.redirect(inventory.url);
        }
    })
];

exports.inventory_delete_get = asyncHandler(async (req, res, next) => {
    const inventory = await Inventory.findById(req.params.id).populate('articles.article').exec();

    if (inventory === null) {
        res.redirect("/catalog/inventory");
    };

    res.render("inventory_delete", {
        title: "Delete Inventory",
        inventory: inventory,
    });
})

exports.inventory_delete_post = asyncHandler(async (req, res, next) => {
    const inventory = await Inventory.findById(req.params.id).populate('articles.article').exec();

    if (inventory.articles.length > 0) {
        res.render("inventory_delete", {
        title: "Delete Inventory",
        inventory: inventory,
        });
        return;
    } else {
        await Inventory.findByIdAndDelete(req.body.inventoryid);
        res.redirect("/catalog/inventory");
    }
})

