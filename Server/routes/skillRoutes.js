// server/routes/skillRoutes.js (Simplified)

const express = require("express");
// const multer = require('multer'); // REMOVED
const { analyzeUserText } = require("../controllers/skillController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// Route now only uses 'protect' middleware
router.post("/analyze", protect, analyzeUserText);

module.exports = router;
