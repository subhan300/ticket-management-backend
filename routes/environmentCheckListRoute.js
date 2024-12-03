const express = require('express');
const {
  addChecklist,
  getChecklists,
  updateChecklist,
  deleteChecklistById,
  deleteAllChecklists,
  getSearchChecklist
} = require('../controllers/environmentChecklistController/environmentChecklistController');
const { authenticateJWT } = require('../middleware/authMiddleware');

const router = express.Router();

// Add a new checklist
router.post('/', authenticateJWT,addChecklist);
router.post('/search', authenticateJWT, getSearchChecklist);

// Get all checklists
router.get('/', authenticateJWT,getChecklists);

// Update checklist by ID
router.put('/:id', authenticateJWT,updateChecklist);
router.delete("/:id",authenticateJWT,deleteChecklistById);
router.delete("/delete/all",authenticateJWT,deleteAllChecklists)

module.exports = router;
