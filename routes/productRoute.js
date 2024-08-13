// stockItemRoutes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController/ProductController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Route to get stock items by company ID
router.get('/', authenticateJWT, productController.getProducts);
router.get('/:SKU', authenticateJWT, productController.getProductById);
router.post('/create', authenticateJWT, productController.createProduct);
router.post('/createInBulk', authenticateJWT, productController.createBulkProduct);
router.put('/update/:SKU', authenticateJWT, productController.updateProduct);
router.delete('/:SKU', authenticateJWT, productController.deleteProduct );

// Other routes like POST /stockitems (create stock item), GET /stockitems/:stockItemId, PUT /stockitems/:stockItemId, DELETE /stockitems/:stockItemId, etc.

module.exports = router;
