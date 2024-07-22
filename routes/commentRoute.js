const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// Ticket Routes
router.post('/:ticketId', commentController.addComment);
router.put('/:ticketId/comment/:commentId', commentController.editComment);
router.delete('/:ticketId/comment/:commentId', commentController.deleteComment);
// router.get('/tickets', commentController.getTickets);

module.exports = router;
