const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/login", authController.login);
router.post("/google", authController.googleSignIn);
router.post("/signup", authController.signup);
router.get("/profile", authController.profile);
router.post("/logout", authController.logout);
router.put("/change-password/:email", authController.changePassword);

module.exports = router;
