const express = require("express");
const router = express.Router();
const connectToDatabase = require("../models/db");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../logger");
const { validationResult } = require("express-validator");

// Helper function for sending error responses
const handleError = (res, loggerMessage, statusCode, clientMessage) => {
  logger.error(loggerMessage);
  return res.status(statusCode).json({ error: clientMessage });
};

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("users");

    const existingEmail = await collection.findOne({ email: req.body.email });
    if (existingEmail) {
      return handleError(res, "Email id already exists", 400, "Email id already exists");
    }

    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(req.body.password, salt);

    const newUser = await collection.insertOne({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: hash,
      createdAt: new Date(),
    });

    const payload = {
      user: {
        id: newUser.insertedId,
      },
    };

    const authtoken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    logger.info("User registered successfully");
    return res.status(200).json({ authtoken, email: req.body.email });
  } catch (e) {
    logger.error("Error during user registration", e);
    return res.status(500).send("Internal server error");
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("users");

    const user = await collection.findOne({ email: req.body.email });
    if (!user) {
      return handleError(res, "User not found", 404, "User not found");
    }

    const isPasswordValid = await bcryptjs.compare(req.body.password, user.password);
    if (!isPasswordValid) {
      return handleError(res, "Passwords do not match", 400, "Wrong password");
    }

    const payload = {
      user: {
        id: user._id.toString(),
      },
    };

    const authtoken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    logger.info("User logged in successfully");
    return res.status(200).json({ authtoken, userName: user.firstName, userEmail: user.email });
  } catch (e) {
    logger.error("Error during user login", e);
    return res.status(500).send("Internal server error");
  }
});

// Update user endpoint
router.put("/update", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error("Validation errors in update request", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const email = req.headers.email;
    if (!email) {
      return handleError(res, "Email not found in the request headers", 400, "Email not found in the request headers");
    }

    const db = await connectToDatabase();
    const collection = db.collection("users");

    const updatedUser = await collection.findOneAndUpdate(
      { email },
      { $set: { firstName: req.body.name, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!updatedUser.value) {
      return handleError(res, "User not found during update", 404, "User not found");
    }

    const payload = {
      user: {
        id: updatedUser.value._id.toString(),
      },
    };

    const authtoken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    logger.info("User updated successfully");
    return res.status(200).json({ authtoken });
  } catch (e) {
    logger.error("Error during user update", e);
    return res.status(500).send("Internal server error");
  }
});

module.exports = router;
