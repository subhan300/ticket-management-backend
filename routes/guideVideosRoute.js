// routes/videoRoutes.js
const express = require('express');
const videoGuideController = require('../controllers/videoGuideController/videoGuideController');
const { authenticateJWT } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/',authenticateJWT, videoGuideController.getAllVideos);
router.post('/', authenticateJWT,videoGuideController.createVideo);
router.get('/:id', authenticateJWT,videoGuideController.getVideoById);
router.put('/:id', authenticateJWT,videoGuideController.updateVideo);
router.delete('/:id', authenticateJWT,videoGuideController.deleteVideo);
router.post('/location', authenticateJWT,videoGuideController.getVideosByLocationIds);

module.exports = router;