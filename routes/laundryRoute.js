const express = require('express');
const router = express.Router();
const {uploadMiddleware} = require('../middleware/Upload');
const laundryController = require('../controllers/laundryController/LaundryController');
const { adminAuthenticateJWT } = require('../middleware/adminAuthMiddleware');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { getAllUsersCollectionByRole } = require('../controllers/globalController/GlobalController');

router.get('/getAll',authenticateJWT,laundryController.getAllTickets);
router.get('/getCompanyTicket',authenticateJWT,laundryController.getCompanyTickets);
router.get('/getResidentItemLocation/:SKU',authenticateJWT,laundryController.getResidentLocationByItemSku);

router.get('/getResidentHistory/:SKU',authenticateJWT,laundryController.getResidentHistory);
router.post('/getResidentItemAndLocation',authenticateJWT,laundryController.getResidentProductsAndLocationBySkuList);
router.get('/location/:locationId',authenticateJWT,laundryController.getFilterLocationTickets);

router.get('/byUserId', authenticateJWT,laundryController.getTicketByUserId);
router.get('/company/usersByRole', authenticateJWT,getAllUsersCollectionByRole);


// here user id mean for the resident this ticket is created 
router.post('/create', authenticateJWT,laundryController.createTicket);
router.put('/update/:ticketId',authenticateJWT,laundryController.updateTicket);
router.delete('/delete/:ticketId', authenticateJWT,laundryController.deleteTicket);

router.post('/addComment', authenticateJWT,uploadMiddleware,laundryController.addComment);
module.exports = router;
