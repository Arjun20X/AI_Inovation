const asyncHandler = require("express-async-handler"); // Helper for error handling
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper function to generate JWT
const generateToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET, {
        expiresIn : '30d',
    });
}



// --- 1. User Registration Logic ---
const registerUser = asyncHandler(async (req , res) => {
    const {name,email,password} = req.body;

    const userExists = await User.findOne({email});

    if(userExists){
        res.status(400); // Bad request
        throw new Error('User already exists');
    }

    const user = await User.create({name,email,password});

    if(user){
        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            token:generateToken(user._id),
        });
    }
    else{
        res.status(400);
        throw new Error('Invalid user data');
    }
});


const loginUser = asyncHandler(async (req,res) => {
    const {email,password} = req.body;

    const user = await User.findOne({email});

    if(user && (await user.matchPassword(password))){
        res.json({
            _id:user._id,
            name:user.name,
            email:user.email,
            token:generateToken(user._id),
        });
    }
    else{
        res.status(401);
        throw new Error('Invalid email or password');
    }

})

module.exports = {registerUser, loginUser};