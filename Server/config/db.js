// config/db.js
const mongoose = require("mongoose");

// Mongoose will automatically pick up the MONGO_URI from the .env file
// via the process.env object (since we loaded it in server.js)
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;
