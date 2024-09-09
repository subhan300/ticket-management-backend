const express = require('express');
const router = express.Router();
const {uploadMiddleware} = require('../middleware/Upload');
const unitController = require('../controllers/unitController/unitController');
const { adminAuthenticateJWT } = require('../middleware/adminAuthMiddleware');
const { authenticateJWT } = require('../middleware/authMiddleware');

router.post('/', unitController.createUnit)

router.post('/create-inbulk', unitController.createUnitsInBulk)
router.put('/:unitId', unitController.updateUnit)

router.delete('/:locationId', unitController.deleteUnitsByLocation)

router.get('/getAll', unitController.getAllUnits);
router.get('/:locationId', unitController.getUnitsByLocationId)
router.get('/company/:companyId', unitController.getUnitsByCompanyId);
router.get('/company/unit/:unitId', unitController.getUnitRoomsByCompanyId);

module.exports = router;
