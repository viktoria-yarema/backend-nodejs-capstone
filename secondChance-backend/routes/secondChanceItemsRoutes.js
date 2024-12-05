const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const connectToDatabase = require("../models/db");
const logger = require("../logger");

// Define the upload directory path
const directoryPath = "public/images";

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath); // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage });

// Get all secondChanceItems
router.get("/", async (req, res, next) => {
  logger.info("/called");
  try {
    const db = await connectToDatabase();
    const collection = db.collection("secondChanceItems");
    const secondChanceItems = await collection.find({}).toArray();

    return res.json(secondChanceItems);
  } catch (e) {
    console.error("oops something went wrong", e);
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("secondChanceItems");
    let secondChanceItem = req.body;

    const lastItemQuery = await collection.find().sort({ id: -1 }).limit(1);

    await lastItemQuery.forEach((item) => {
      secondChanceItem.id = (parseInt(item.id) + 1).toString();
    });

    const date_added = Math.floor(new Date().getTime() / 1000);
    secondChanceItem.date_added = date_added;

    secondChanceItem = await collection.insertOne(secondChanceItem);

    return res.status(201).json(secondChanceItem.ops[0]);
  } catch (e) {
    next(e);
  }
});

// Get a single secondChanceItem by ID
router.get("/:id", async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("secondChanceItems");

    const secondChanceItem = await collection.findOne({ id: req.params.id });

    if (!secondChanceItem) {
      return res.status(404).json({ message: "SecondChanceItem not found" });
    }

    return res.status(200).json(secondChanceItem);
  } catch (e) {
    console.error("Error in GET /:id", e);
    res
      .status(500)
      .json({ message: "An error occurred while fetching the item." });
    next(e);
  }
});

// Update and existing item
router.put("/:id", async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("secondChanceItems");

    const secondChanceItem = await collection.findOne({ id: req.params.id });

    if (!secondChanceItem) {
      logger.error("secondChanceItem not found");
      return res.status(404).json({ message: "SecondChanceItem not found" });
    }

    const updatedSecondChanceItem = await collection.find(
      { id: req.params.id },
      {
        $set: {
          ...req.body,
          updatedAt: new Date(),
          age_years: Number((secondChanceItem.age_days / 365).toFixed(1)),
        },
      },
      { returnDocument: "after" },
    );

    if (updatedSecondChanceItem) {
      return res.json({ uploaded: "success" });
    } else {
      return res.json({ uploaded: "failed" });
    }
  } catch (e) {
    next(e);
  }
});

// Delete an existing item
router.delete("/:id", async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("secondChanceItems");

    const secondChanceItem = await collection.findOne({ id: req.params.id });

    if (!secondChanceItem) {
      logger.error("secondChanceItem not found");
      return res.status(404).json({ message: "SecondChanceItem not found" });
    }

    await collection.deleteOne({ id: req.params.id });
    return res.json({ deleted: "success" });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
