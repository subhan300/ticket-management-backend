// userRoutes.js

const express = require('express');
const router = express.Router();
const testingController = require('../controllers/testingController');

// Route for creating a new user
router.get('/', testingController.testGet);

// Other routes like GET /users/:id, PUT /users/:id, DELETE /users/:id, etc.

module.exports = router;
