const express = require('express');
const router = express.Router();
const {uploadMiddleware} = require('../middleware/Upload');
const ticketController = require('../controllers/ticketController');
const { adminAuthenticateJWT } = require('../middleware/adminAuthMiddleware');
const { authenticateJWT } = require('../middleware/authMiddleware');

router.get('/getAll',authenticateJWT,ticketController.getAllTickets);
router.post('/search',authenticateJWT,ticketController.searchTicket);
router.get('/getCompanyTicket',authenticateJWT,ticketController.getCompanyTickets);
router.post('/:id',authenticateJWT,ticketController.getTicketById);

router.get('/getFilteredCompanyTickets',authenticateJWT,ticketController.getFilterCompanyTickets);

router.get('/user/:userId', authenticateJWT,ticketController.getTicketByUserId);
// here user id mean for the resident this ticket is created 
router.get('/history/:SKU', authenticateJWT,ticketController.getUserTicket);
router.post('/create', authenticateJWT,ticketController.createTicket);

router.put('/update/:ticketId',authenticateJWT,ticketController.updateTicket);
router.delete('/delete/:ticketId', authenticateJWT,ticketController.deleteTicket);

router.post('/addComment', authenticateJWT,uploadMiddleware,ticketController.addComment);
module.exports = router;
