const express = require('express');
const router = express.Router();

const { authenticateJWT } = require('../middleware/authMiddleware');
const { adminAuthenticateJWT } = require('../middleware/adminAuthMiddleware');
const { sheduleTicketCreation } = require('../controllers/sheduleController/sheduleController');

// GET all usage details
router.post('/ticket-creation',authenticateJWT,sheduleTicketCreation);

// // GET usage details by Company ID
// router.get('/:companyId',authenticateJWT,usedInController.getUsageDetailsByCompany);

// // POST create new usage detail
// router.post('/create',authenticateJWT, usedInController.createUsageDetail);

module.exports = router;
