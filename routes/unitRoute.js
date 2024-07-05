const express = require('express');
const router = express.Router();
const {uploadMiddleware} = require('../middleware/Upload');
const unitController = require('../controllers/unitController/unitController');
const { adminAuthenticateJWT } = require('../middleware/adminAuthMiddleware');
const { authenticateJWT } = require('../middleware/authMiddleware');

router.get('/getAll', unitController.getAllUnits);
router.get('/company/:companyId', unitController.geUnitsByCompanyId);
router.get('/company/unit/:unitId', unitController.geUnitRoomsByCompanyId);

module.exports = router;
