// companyRoutes.js

const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { adminAuthenticateJWT } = require('../middleware/adminAuthMiddleware');
const {authenticateJWT}=require("../middleware/authMiddleware")
// Route to get all companies
router.get('/getAll', adminAuthenticateJWT, companyController.getAllCompanies);

// Route to get company by ID
router.get('/:companyId', authenticateJWT, companyController.getCompanyById);
router.post('/create', adminAuthenticateJWT, companyController.createCompany);
router.post('/:companyId/units', companyController.addUnit);
router.post('/units/:unitId/rooms', companyController.addRoom);

// Other routes like POST /companies (create company), PUT /companies/:companyId, DELETE /companies/:companyId, etc.

module.exports = router;
