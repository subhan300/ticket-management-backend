const express = require('express');

const { addPredefinedQuestion, getPredefinedQuestion, updatePredefinedQuestion, addPredefinedQuestionInBulk } = require('../controllers/predefinedChecklistQuestionController/predefinedChecklistQuestionController');
const { authenticateJWT } = require('../middleware/authMiddleware');

const router = express.Router();

// Add a new checklist
router.post('/',authenticateJWT, addPredefinedQuestion);
router.post('/in-bulk',authenticateJWT, addPredefinedQuestionInBulk);

// Get all checklists
router.get('/',authenticateJWT, getPredefinedQuestion);

// Update checklist by ID
router.put('/:id',authenticateJWT, updatePredefinedQuestion);

module.exports = router;
