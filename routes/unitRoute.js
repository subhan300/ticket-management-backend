const express = require('express');
const router = express.Router();
const {uploadMiddleware} = require('../middleware/Upload');
const unitController = require('../controllers/unitController/unitController');
const { adminAuthenticateJWT } = require('../middleware/adminAuthMiddleware');
const { authenticateJWT } = require('../middleware/authMiddleware');

router.post('/', authenticateJWT,unitController.createUnit)

router.post('/create-inbulk', authenticateJWT,unitController.createUnitsInBulk)
router.post('/create-unit-rooms',authenticateJWT, unitController.createUnitAndRooms)
router.put('/:id',authenticateJWT, unitController.updateUnit)

// router.delete('/:locationId', unitController.deleteUnitsByLocation)
router.delete('/:id', authenticateJWT,unitController.deleteUnitById)

router.get('/getAll',authenticateJWT, unitController.getAllUnits);
router.get('/:locationId',authenticateJWT, unitController.getUnitsByLocationId)

router.get('/company/:companyId', authenticateJWT,unitController.getUnitsByCompanyId);
// i dont need thisone ,remove it 
router.get('/company/unit/:unitId', authenticateJWT,unitController.getUnitRoomsByCompanyId);

module.exports = router;
