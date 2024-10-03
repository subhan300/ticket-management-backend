// routes/supplierRoutes.js
const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController/supplierController');

// Create a new supplier
router.post('/create', supplierController.createSupplier);

// Get all suppliers
router.get('/', supplierController.getAllSuppliers);

// Get a single supplier by ID
router.get('/:id', supplierController.getSupplierById);

// Update a supplier
router.put('/:id', supplierController.updateSupplier);

// Delete a supplier
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router;
