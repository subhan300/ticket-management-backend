// stockItemRoutes.js

const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Route to get stock items by company ID
router.get('/company/:companyId', authenticateJWT, inventoryController.getInventoryItemsByCompany);
router.get('/company/short-details/:id', authenticateJWT, inventoryController.getInventoryItemShortDetail);
router.post('/create/:companyId', authenticateJWT, inventoryController.createInventoryItem);
router.post('/createInBulk/:companyId', authenticateJWT, inventoryController.createBulkInventoryItem);
router.put('/update/:productId', authenticateJWT, inventoryController.updateInventoryItem );
router.delete('/:inventoryId', authenticateJWT, inventoryController.deleteInventoryItem );
router.delete('/', authenticateJWT, inventoryController.deleteInventory );
router.get('/:SKU', authenticateJWT, inventoryController.getProductBySku);
router.post('/recieveInventory', authenticateJWT, inventoryController.receiveInventory);


module.exports = router;
