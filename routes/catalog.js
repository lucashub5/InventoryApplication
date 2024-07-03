const express = require("express");
const router = express.Router();

const article_controller = require("../controllers/articleController");
const category_controller = require("../controllers/categoryController");
const inventory_controller = require("../controllers/inventoryController");

//CATEGORIES//

router.get("/", category_controller.index);

router.get("/category/create", category_controller.category_create_get);

router.post("/category/create", category_controller.category_create_post);

router.get("/category/:id/delete", category_controller.category_delete_get);

router.post("/category/:id/delete", category_controller.category_delete_post);

router.get("/category/:id/update", category_controller.category_update_get);

router.post("/category/:id/update", category_controller.category_update_post);

router.get("/category/:id", category_controller.category_detail);

router.get("/category", category_controller.category_list);

//ARTICLES//

router.get("/article/create", article_controller.article_create_get);

router.post("/article/create", article_controller.article_create_post);

router.get("/article/:id/delete", article_controller.article_delete_get);

router.post("/article/:id/delete", article_controller.article_delete_post);

router.get("/article/:id/update", article_controller.article_update_get);

router.post("/article/:id/update", article_controller.article_update_post);

router.get("/article/:id", article_controller.article_detail);

router.post("/article/:id/add_inventory", article_controller.article_add_inventory_post)

//INVENTORIES//

router.get("/inventory", inventory_controller.inventory_list);

router.get("/inventory/create", inventory_controller.inventory_create_get);

router.post("/inventory/create", inventory_controller.inventory_create_post);

router.get("/inventory/:id", inventory_controller.inventory_detail);

router.get("/inventory/:id/delete", inventory_controller.inventory_delete_get);

router.post("/inventory/:id/delete", inventory_controller.inventory_delete_post);

module.exports = router;