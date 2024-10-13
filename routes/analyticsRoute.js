// routes/analyticsRoutes.js

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController/analyticsController');
const { authenticateJWT } = require('../middleware/authMiddleware');

router.post('/tickets',authenticateJWT, analyticsController.getTicketAnalytics);

router.post('/tickets-charts',authenticateJWT, analyticsController.getTicketAnalyticsForChart);
router.post('/laundaryTickets-charts',authenticateJWT, analyticsController. getLaundryTicketAnalyticsForChart);

// Routes for laundry ticket analytics
router.get('/laundry-tickets',authenticateJWT, analyticsController.getLaundryTicketAnalytics);

// Routes for inventory analytics
router.get('/inventory',authenticateJWT, analyticsController.getInventoryAnalytics);
router.get('/users',authenticateJWT, analyticsController.getUsersAnalytics);

module.exports = router;
