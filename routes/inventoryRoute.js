// stockItemRoutes.js

const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Route to get stock items by company ID
router.get('/company/:companyId', authenticateJWT, inventoryController.getInventoryItemsByCompany);
router.get('/company/:companyId/short-detail', authenticateJWT, inventoryController.getInventoryItemShortDetail);
router.post('/create/:companyId', authenticateJWT, inventoryController.createInventoryItem);
router.post('/createInBulk/:companyId', authenticateJWT, inventoryController.createBulkInventoryItem);
router.put('/update/:companyId', authenticateJWT, inventoryController.updateInventoryItem );
router.delete('/:inventoryId', authenticateJWT, inventoryController.updateInventoryItem );

// Other routes like POST /stockitems (create stock item), GET /stockitems/:stockItemId, PUT /stockitems/:stockItemId, DELETE /stockitems/:stockItemId, etc.

module.exports = router;
