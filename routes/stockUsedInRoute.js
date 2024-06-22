const express = require('express');
const router = express.Router();
const usedInController = require('../controllers/stockUsedInController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { adminAuthenticateJWT } = require('../middleware/adminAuthMiddleware');

// GET all usage details
router.get('/getAll',adminAuthenticateJWT,usedInController.getAllUsageDetails);

// GET usage details by Company ID
router.get('/:companyId',authenticateJWT,usedInController.getUsageDetailsByCompany);

// POST create new usage detail
router.post('/create',authenticateJWT, usedInController.createUsageDetail);

module.exports = router;
