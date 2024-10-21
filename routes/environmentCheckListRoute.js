const express = require('express');
const {
  addChecklist,
  getChecklists,
  updateChecklist,
  deleteChecklistById,
  deleteAllChecklists
} = require('../controllers/environmentChecklistController/environmentChecklistController');

const router = express.Router();

// Add a new checklist
router.post('/', addChecklist);

// Get all checklists
router.get('/', getChecklists);

// Update checklist by ID
router.put('/:id', updateChecklist);
router.delete("/:id",deleteChecklistById);
router.delete("/delete/all",deleteAllChecklists)

module.exports = router;
