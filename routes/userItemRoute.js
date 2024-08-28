const express = require('express');
const router = express.Router();
const userItemController = require('../controllers/userItemController/userItemController');

// Create a new item
router.post('/', userItemController.createItem);
router.post('/bulk-creation', userItemController.createBulkItem);

// Get all items for a user
router.get('/user/:room', userItemController.getUserItemsByRoom);

// Get a specific item
router.get('/:SKU', userItemController.getItemById);

// Update an item
router.put('/:itemId', userItemController.updateItem);

// Delete an item
router.delete('/:itemId', userItemController.deleteItem);

module.exports = router;
