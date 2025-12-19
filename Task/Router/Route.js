const controller=require("../Controller/Controller.js");
const express=require("express");
const router=express.Router();

router.get("/data",controller.getAll);
router.get("/data/:id",controller.getDataById);
module.exports = router;