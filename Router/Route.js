const controller = require("../Controller/Controller.js");
const express = require("express");
const router = express.Router();

// Auto parts routes
router.get("/", controller.getAll);
router.get("/:id", controller.getPartById);
router.post("/", controller.protect, controller.restrictTo("admin"), controller.createPart);
router.put("/:id", controller.protect, controller.restrictTo("admin"), controller.updatePart);
router.delete("/:id", controller.protect, controller.restrictTo("admin"), controller.deletePart);

// Auth routes
router.post("/auth/signup", controller.signup);
router.post("/auth/login", controller.login);
router.get("/auth/users", controller.protect, controller.restrictTo("admin"), controller.getUsers);
router.put("/auth/users/:id", controller.protect, controller.restrictTo("admin"), controller.updateUser);
router.delete("/auth/users/:id", controller.protect, controller.restrictTo("admin"), controller.deleteUser);

// Orders routes
router.post("/auth/orders", controller.protect, controller.addOrder);
router.get("/auth/orders", controller.protect, controller.getUserOrders);

module.exports = router;