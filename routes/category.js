const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { Category } = require("../models");

router.get("/categories", adminController.getCategories);
router.get("/categories/create", adminController.getCreateCategory);
router.post("/categories/create", adminController.postCreateCategory);
router.get("/categories/:id", adminController.getCategoryDetails);
router.get("/categories/:id/edit", adminController.getEditCategory);
router.post("/categories/:id/edit", adminController.postEditCategory);
router.post("/categories/:id/delete", adminController.deleteCategory);
