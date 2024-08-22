const express = require('express');
const router = express.Router();
const {uploadMiddleware} = require('../middleware/Upload');
const laundryController = require('../controllers/laundryController/LaundryController');
const { adminAuthenticateJWT } = require('../middleware/adminAuthMiddleware');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { getAllUsersCollectionByRole } = require('../controllers/globalController/GlobalController');

router.get('/getAll',laundryController.getAllTickets);
router.get('/getCompanyTicket',authenticateJWT,laundryController.getCompanyTickets);
router.get('/getResidentLocation/:residentId',authenticateJWT,laundryController. getResidentLocationById);
router.get('/getResidentItemLocation/:SKU',authenticateJWT,laundryController.getResidentLocationByItemSku);

router.get('/getFilteredCompanyTickets',authenticateJWT,laundryController.getFilterCompanyTickets);

router.get('/user/:userId', authenticateJWT,laundryController.getTicketByUserId);
router.get('/company/users/:role', authenticateJWT,getAllUsersCollectionByRole);
// here user id mean for the resident this ticket is created 
router.get('/history/:SKU', authenticateJWT,laundryController.getUserTicket);
router.post('/create', authenticateJWT,laundryController.createTicket);

router.put('/update/:ticketId',authenticateJWT,laundryController.updateTicket);
router.delete('/delete/:ticketId', authenticateJWT,laundryController.deleteTicket);

router.post('/addComment', authenticateJWT,uploadMiddleware,laundryController.addComment);
module.exports = router;
