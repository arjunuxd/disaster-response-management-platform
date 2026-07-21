const express = require('express');
const router = express.Router();
const { ApiResponse } = require('../utils');

// Health check route
router.get('/', (req, res) => {
  const response = new ApiResponse(200, null, 'API Running Successfully');
  res.status(response.statusCode).json({
    message: response.message,
    success: response.success,
  });
});

module.exports = router;
