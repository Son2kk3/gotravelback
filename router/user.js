var express = require("express");
var router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", userController.getUser);
router.get("/:id", authMiddleware, userController.getUserById);
router.patch("/:id", authMiddleware, userController.updateUser);
router.patch("/:username", userController.changePassword);
router.patch("/follow/:followId", authMiddleware, userController.followUser);

module.exports = router;
