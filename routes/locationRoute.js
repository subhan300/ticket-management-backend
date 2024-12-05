// locationRoutes.js

const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController/LocationController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Create a new location
router.post('/', authenticateJWT,locationController.createLocation);
router.post('/getLocationsByIds', authenticateJWT,locationController.getLocationsByIds);


// Get all locations
router.get('/', authenticateJWT,locationController.getLocations);

// Get a single location by ID
router.get('/:SKU',authenticateJWT, locationController.getLocationById);

// Update a location by ID
router.put('/:id',authenticateJWT, locationController.updateLocation);

// Delete a location by ID
router.delete('/:id',authenticateJWT, locationController.deleteLocation);
router.get('/get/settings',authenticateJWT, locationController.getLocationSettings);

module.exports = router;
