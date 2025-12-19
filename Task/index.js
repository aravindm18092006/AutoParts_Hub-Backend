const express = require("express");
const app = express();
app.use(express.json());
const Router = require("./Router/Route.js");

app.use("/api",Router)

module.exports=app;