const EnvironmentChecklist = require('../../models/environmentInspection');

// Add a new checklist
const addChecklist = async (req, res) => {
  try {
    const { year, month, week, checkList } = req.body;

    // Ensure year, month, week, and checkList are provided
    if (!year || !month || !week || !checkList || !Array.isArray(checkList)) {
      return res.status(400).json({ message: 'Year, month, week, and checkList are required.' });
    }

    // Check if a checklist for the same year, month, and week already exists
    const existingChecklist = await EnvironmentChecklist.findOne({ year, month, week });

    if (existingChecklist) {
      return res.status(409).json({ message: 'Checklist for this year, month, and week already exists.' });
    }

    // If not, create a new checklist
    const newChecklist = new EnvironmentChecklist({
      year,
      month,
      week,
      checkList,
    });

    await newChecklist.save();
    res.status(201).json(newChecklist);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};


// Update an existing checklist
const updateChecklist = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const checklist = await EnvironmentChecklist.findById(id);
    if (!checklist) {
      return res.status(404).json({ error: 'EnvironmentChecklist not found' });
    }

    // Update month, week, and checkList fields
    checklist.month = updatedData.month || checklist.month;
    checklist.week = updatedData.week || checklist.week;
    checklist.checkList = updatedData.checkList || checklist.checkList;

    await checklist.save();
    res.status(200).json(checklist);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all checklists
const getChecklists = async (req, res) => {
  try {
    const checklists = await EnvironmentChecklist.find();
    res.status(200).json(checklists);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete all checklists
const deleteAllChecklists = async (req, res) => {
  try {
    await EnvironmentChecklist.deleteMany({});
    res.status(204).send(); // No content
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete checklist by ID
const deleteChecklistById = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedChecklist = await EnvironmentChecklist.findByIdAndDelete(id);
    if (!deletedChecklist) {
      return res.status(404).json({ error: 'EnvironmentChecklist not found' });
    }
    res.status(204).send(); // No content
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  addChecklist,
  getChecklists,
  updateChecklist,
  deleteAllChecklists,
  deleteChecklistById,
};
