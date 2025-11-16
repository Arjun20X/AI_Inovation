const express = require("express");
const {registerUser, loginUser} = require('../controllers/auth');
const router = express.Router();

// POST /api/auth/register
router.post('/register',registerUser);

// POST /api/auth/login
router.post('/login',loginUser);

module.exports = router;