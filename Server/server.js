// server/server.js (Final Standard Configuration)

require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const skillRoutes = require("./routes/skillRoutes"); // <-- Contains Multer
const { errorHandler } = require("./middleware/errorMiddleware");
const app = express();

// CONNECT DATABASE
connectDB();

// --- MIDDLEWARE ---

// Enable CORS
app.use(cors());

// Standard body parsers (used for authentication and text submissions)
app.use(express.json({ limit: "5mb" })); // <-- FIX IS HERE
app.use(express.urlencoded({ limit: "5mb", extended: false }));

// --- ROUTES ---
app.use("/api/auth", authRoutes);
// Multer is attached directly to the /api/skills/analyze route inside skillRoutes.js

// This is the fallback route for API access
app.use("/api/skills", skillRoutes);

app.get("/", (req, res) => {
  res.send("Skill Gap Platform API is running...");
});

// --- Custom Error Middleware --- (Must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
