const EnvironmentChecklist = require('../../models/environmentInspection');

// Add a new checklist
const addChecklist = async (req, res) => {
  try {
     const {locations}=req.user
    const { year, month, week, checkList } = req.body;

    // Ensure year, month, week, and checkList are provided
    if (!year || !month || !week || !checkList || !Array.isArray(checkList)) {
      return res.status(400).json({ message: 'Year, month, week, and checkList are required.' });
    }

    // Check if a checklist for the same year, month, and week already exists
    const existingChecklist = await EnvironmentChecklist.findOne({ year, month, week,location:{$in:locations} });

    if (existingChecklist) {
      return res.status(409).json({ message: 'Checklist for this year, month, and week already exists.' });
    }

    // If not, create a new checklist
    const newChecklist = new EnvironmentChecklist({
      year,
      month,
      week,
      checkList,
      location:locations[0]
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
  console.log("id_____",id)
  const updatedData = req.body;

  try {
    const checklist = await EnvironmentChecklist.findById(id);
    console.log("check list",checklist)
    if (!checklist) {
      return res.status(404).json({ message: 'EnvironmentChecklist not found' });
    }

    // Update month, week, and checkList fields
    checklist.month = updatedData.month || checklist.month;
    checklist.week = updatedData.week || checklist.week;
    checklist.year = updatedData.year || checklist.year;
    checklist.checkList = updatedData.checkList || checklist.checkList;

    await checklist.save();
    res.status(200).json(checklist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all checklists
const getChecklists = async (req, res) => {
  try {
    const {locations}=req.user

    const checklists = await EnvironmentChecklist.find({location: { $in: locations },});
    res.status(200).json(checklists);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const  getSearchChecklist= async (req, res) => {
  try {
    const {locations}=req.user
    const { month, year, week } = req.body; // Using query parameters

    if (!month || !year || !week) {
      return res.status(400).json({ error: "Month, year, and week are required." });
    }

    const checklists = await EnvironmentChecklist.find({ month, year, week, location: { $in: locations }, });
    res.status(200).json(checklists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAll = async (req, res) => {
  try {
    const location = "66df7372e2fe86332f1ad7c5";

    const result = await EnvironmentChecklist.updateMany(
      { $set: { location: location } } 
    );
  console.log('result',result)
  } catch (error) {
    console.error("Error updating temperature readings:", error);
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
  getSearchChecklist,
  addChecklist,
  getChecklists,
  updateChecklist,
  deleteAllChecklists,
  deleteChecklistById,
};
