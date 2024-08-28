// userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route for creating a new user
router.post('/signup', userController.createUser);
router.post('/login', userController.login);
router.put('/update/:id', userController.updateUser);

// Other routes like GET /users/:id, PUT /users/:id, DELETE /users/:id, etc.

module.exports = router;
