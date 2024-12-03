// routes/supplierRoutes.js
const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController/supplierController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Create a new supplier
router.post('/create', authenticateJWT,supplierController.createSupplier);

// Get all suppliers
router.get('/', authenticateJWT,supplierController.getAllSuppliers);


// Get a single supplier by ID
router.get('/:id', authenticateJWT,supplierController.getSupplierById);

// Update a supplier
router.put('/:id', authenticateJWT,supplierController.updateSupplier);

// Delete a supplier
router.delete('/:id', authenticateJWT,supplierController.deleteSupplier);

module.exports = router;
