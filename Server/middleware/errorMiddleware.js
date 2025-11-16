// middleware/errorMiddleware.js
// Middleware always has four arguments: (err, req, res, next)
const errorHandler = (err, req, res, next) => {
  // ... custom logic ...
  console.error(err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { errorHandler }; // MUST export the function
