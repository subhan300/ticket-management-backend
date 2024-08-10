const express = require('express');
const { getAllNotifications ,deleteNotifications,updateNotification} = require('../controllers/notificationController/NotificationController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const router = express.Router();
// const commentController = require('../controllers/commentController');

// // Ticket Routes
// router.post('/:ticketId', commentController.addComment);
// router.put('/:ticketId/comment/:commentId', commentController.editComment);
// router.delete('/:ticketId/comment/:commentId', commentController.deleteComment);
router.get('/',authenticateJWT ,getAllNotifications);
router.delete('/',authenticateJWT ,deleteNotifications);
router.put('/',authenticateJWT ,updateNotification);

module.exports = router;
