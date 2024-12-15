/*jshint esversion: 8 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pinoLogger = require("./logger");

const connectToDatabase = require("./models/db");

const app = express();
app.use("*", cors());
const port = process.env.PORT || 3060;
const host = "0.0.0.0"; // Important for Docker/container environments

// Connect to MongoDB; we just do this one time
connectToDatabase()
  .then(() => {
    pinoLogger.info("Connected to DB");
  })
  .catch((e) => console.error("Failed to connect to DB", e));

app.use(express.json());

// Route files
const authRoutes = require("./routes/authRoutes");
const secondChanceItemsRoutes = require("./routes/secondChanceItemsRoutes");
const searchRoutes = require("./routes/searchRoutes");

const pinoHttp = require("pino-http");
const logger = require("./logger");

app.use(pinoHttp({ logger }));

// Use Routes

app.use("/api/secondchance/auth", authRoutes);
app.use("/api/secondchance/items", secondChanceItemsRoutes);
app.use("/api/secondchance/search", searchRoutes);

// Global Error Handler
app.use((err, _, res) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

app.get("/", (_, res) => {
  res.send("Inside the server");
});

app.listen(3060, () => {
  console.log("Server running on port 3060");
});
