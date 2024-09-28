const express = require('express');
const router = express.Router();
const userItemController = require('../controllers/userItemController/userItemController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Create a new item
router.post('/', userItemController.createItem);
router.post('/bulk-creation',authenticateJWT, userItemController.createBulkItem);

// Get all items for a user
router.get('/user/:room', userItemController.getUserItemsByRoom);
router.get('/getAll',authenticateJWT, userItemController.getUserItems);

// Get a specific item
router.get('/:SKU', userItemController.getItemById);

// Update an item
router.put('/:itemId', userItemController.updateItem);
router.post('/bulk-update', authenticateJWT,userItemController.updateBulkItem);

// Delete an item
router.delete('/:itemId', userItemController.deleteItem);

module.exports = router;
