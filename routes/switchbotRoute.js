// routes/analyticsRoutes.js

const express = require('express');
const router = express.Router();

const { authenticateJWT } = require('../middleware/authMiddleware');
const { getSignature, getDevices, getDevicesStatus } = require('../controllers/switchbotController/SwitchBotController');

router.post('/generate-signature',authenticateJWT, getSignature);
router.get('/devices',authenticateJWT, getDevices);
router.post('/devices-status',authenticateJWT, getDevicesStatus);



module.exports = router;
