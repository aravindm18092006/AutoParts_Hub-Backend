const User = require('../models/User');
const Part = require('../models/Part');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Middleware to protect routes (auth verification)
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "Not authorized, token missing"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "fail",
      message: "Not authorized, token verification failed"
    });
  }
};

// Get all parts grouped by category (for frontend compatibility)
exports.getAll = async (req, res) => {
  try {
    const parts = await Part.find();
    
    // Group parts by category
    const categoriesMap = {};
    parts.forEach(part => {
      const category = part.category;
      if (!categoriesMap[category]) {
        categoriesMap[category] = [];
      }
      categoriesMap[category].push({
        card: {
          info: {
            id: part._id.toString(),
            name: part.name,
            category: part.category,
            description: part.description,
            imgName: part.imgName,
            inStock: part.inStock,
            defaultPrice: part.defaultPrice,
            rating: part.rating,
            ratingCount: part.ratingCount,
            specifications: part.specifications
          }
        }
      });
    });

    const structuredData = Object.keys(categoriesMap).map(categoryName => ({
      card: {
        card: {
          title: `${categoryName} Parts`,
          itemCards: categoriesMap[categoryName]
        }
      }
    }));

    res.status(200).json({
      status: "success",
      data: structuredData,
      rawParts: parts // sending raw list too for convenience if needed
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// Get part by ID
exports.getPartById = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) {
      return res.status(404).json({
        status: "fail",
        message: "Part not found"
      });
    }

    // Wrap in expected itemCard structure for safety, and send raw info
    res.status(200).json({
      status: "success",
      data: {
        card: {
          info: {
            id: part._id.toString(),
            name: part.name,
            category: part.category,
            description: part.description,
            imgName: part.imgName,
            inStock: part.inStock,
            defaultPrice: part.defaultPrice,
            rating: part.rating,
            ratingCount: part.ratingCount,
            specifications: part.specifications
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// Create a new part (Admin Action)
exports.createPart = async (req, res) => {
  try {
    const { name, category, description, imgName, inStock, defaultPrice, specifications } = req.body;
    
    if (!name || !category || !description || !defaultPrice) {
      return res.status(400).json({
        status: "fail",
        message: "Name, category, description and price are required"
      });
    }

    const newPart = await Part.create({
      name,
      category,
      description,
      imgName: imgName || 'download.png',
      inStock: inStock !== undefined ? inStock : 10,
      defaultPrice,
      specifications: specifications || {}
    });

    res.status(201).json({
      status: "success",
      data: newPart
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// Update a part (Admin Action)
exports.updatePart = async (req, res) => {
  try {
    const updatedPart = await Part.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedPart) {
      return res.status(404).json({
        status: "fail",
        message: "Part not found"
      });
    }

    res.status(200).json({
      status: "success",
      message: "Part updated successfully",
      data: updatedPart
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// Delete a part (Admin Action)
exports.deletePart = async (req, res) => {
  try {
    const deletedPart = await Part.findByIdAndDelete(req.params.id);
    if (!deletedPart) {
      return res.status(404).json({
        status: "fail",
        message: "Part not found"
      });
    }

    res.status(200).json({
      status: "success",
      message: "Part deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// Place Checkout Order
exports.addOrder = async (req, res) => {
  try {
    const { items, billingAddress, phone, totalAmount } = req.body;
    
    if (!items || items.length === 0 || !billingAddress || !phone || !totalAmount) {
      return res.status(400).json({
        status: "fail",
        message: "Order items, billing address, phone, and total amount are required"
      });
    }

    // Create the order referencing req.userId (attached by exports.protect)
    const newOrder = await Order.create({
      user: req.userId,
      items: items.map(item => ({
        part: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1
      })),
      billingAddress,
      phone,
      totalAmount
    });

    // Optional: decrement stock of ordered items
    for (const item of items) {
      await Part.findByIdAndUpdate(item.id, { $inc: { inStock: -item.quantity } });
    }

    res.status(201).json({
      status: "success",
      data: newOrder
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// Get current user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// AUTH CONTROLLERS
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Name, email, and password are required"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "User already exists with this email"
      });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      status: "success",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password"
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      status: "success",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      status: "success",
      data: users
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// Authorization middleware
exports.restrictTo = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({
          status: "fail",
          message: "You do not have permission to perform this action"
        });
      }
      next();
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message
      });
    }
  };
};

// Admin action: Update user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found"
      });
    }

    res.status(200).json({
      status: "success",
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// Admin action: Delete user
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found"
      });
    }

    res.status(200).json({
      status: "success",
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};
