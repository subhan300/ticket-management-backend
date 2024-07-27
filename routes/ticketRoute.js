const express = require('express');
const router = express.Router();
const {uploadMiddleware} = require('../middleware/Upload');
const ticketController = require('../controllers/ticketController');
const { adminAuthenticateJWT } = require('../middleware/adminAuthMiddleware');
const { authenticateJWT } = require('../middleware/authMiddleware');

router.get('/getAll',ticketController.getAllTickets);

router.get('/getFilteredCompanyTickets',authenticateJWT,ticketController.getFilterCompanyTickets);
// router.get('/assigned/:userId', authenticateJWT,ticketController.getTicketByUserAssignedId);
router.get('/user/:userId', authenticateJWT,ticketController.getTicketByUserId);
router.post('/create', authenticateJWT,ticketController.createTicket);

router.put('/update/:ticketId',authenticateJWT,ticketController.updateTicket);
router.delete('/delete/:ticketId', authenticateJWT,ticketController.deleteTicket);

router.post('/addComment', authenticateJWT,uploadMiddleware,ticketController.addComment);
module.exports = router;
