// stockItemRoutes.js

const express = require('express');
const router = express.Router();
const stockItemController = require('../controllers/stockController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Route to get stock items by company ID
router.get('/company/:companyId', authenticateJWT, stockItemController.getStockItemsByCompany);
router.post('/create/:companyId', authenticateJWT, stockItemController.createStockItem);

// Other routes like POST /stockitems (create stock item), GET /stockitems/:stockItemId, PUT /stockitems/:stockItemId, DELETE /stockitems/:stockItemId, etc.

module.exports = router;
