const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");

const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const studioRoutes = require("./routes/studioRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

// Allow only configured frontends to send cookie-based requests to the API.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("This website is not allowed to access the API."));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// A small endpoint for checking that the API process is responding.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "StudioSpace API is running." });
});

// Keep each feature's routes in a separate file so the app setup stays easy to scan.
app.use("/api/auth", authRoutes);
app.use("/api/studios", studioRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/uploads", uploadRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "The requested API route was not found." });
});

app.use(errorHandler);

module.exports = app;
