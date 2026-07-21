const errorHandler = require('./errorHandler');
const { protect, authorize } = require('./authMiddleware');

module.exports = { errorHandler, protect, authorize };
