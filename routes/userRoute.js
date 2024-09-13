// userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Route for creating a new user
router.post('/signup', userController.createUser);
router.post('/login', userController.login);
router.put('/update/:id', userController.updateUser);
router.get('/:role', authenticateJWT,userController.getUsersByRole);

// Other routes like GET /users/:id, PUT /users/:id, DELETE /users/:id, etc.

module.exports = router;
