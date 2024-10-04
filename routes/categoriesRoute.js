const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoriesCotroller/CategoriesController');

// Create a category
router.post('/', categoryController.createCategory);

// Edit a category
router.put('/:id', categoryController.updateCategory);

// Delete a category
router.delete('/:id', categoryController.deleteCategory);

// Create categories in bulk
router.post('/bulk', categoryController.createCategoriesInBulk);

// Get all categories
router.get('/:type', categoryController.getAllCategories);

module.exports = router;
