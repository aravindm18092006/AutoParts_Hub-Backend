const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const app = express();

// Connect to MongoDB
const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/autoparts_hub';
console.log('Connecting to MongoDB:', mongoUrl);

mongoose.connect(mongoUrl)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} - Body:`, req.body);
  next();
});

// Serve static files (images)
app.use('/images', express.static(path.join(__dirname, '../Frontend/frontend/public/Images')));

const Router = require("./Router/Route.js");
app.use("/api", Router);

module.exports = app;