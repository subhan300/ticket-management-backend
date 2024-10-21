const express = require('express');

const { addPredefinedQuestion, getPredefinedQuestion, updatePredefinedQuestion, addPredefinedQuestionInBulk } = require('../controllers/predefinedChecklistQuestionController/predefinedChecklistQuestionController');

const router = express.Router();

// Add a new checklist
router.post('/', addPredefinedQuestion);
router.post('/in-bulk', addPredefinedQuestionInBulk);

// Get all checklists
router.get('/', getPredefinedQuestion);

// Update checklist by ID
router.put('/:id', updatePredefinedQuestion);

module.exports = router;
