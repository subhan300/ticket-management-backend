const PredefinedQuestion = require('../../models/predefinedQuestion');

// Add a user response (only answers)
const addPredefinedQuestion = async (req, res) => {
  try {
    const {  category, questions } = req.body;

    const newResponse = new PredefinedQuestion({
      category,
     questions
    });

    const savedResponse = await newResponse.save();
    res.status(201).json(savedResponse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const addPredefinedQuestionInBulk = async (req, res) => {
  try {
    const predefinedQuestions = req.body;

    const savedResponses = await PredefinedQuestion.insertMany( predefinedQuestions )
    res.status(201).json(savedResponses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all user responses
const getPredefinedQuestion = async (req, res) => {
  try {
    const {locations}=req.user;
    const responses = await PredefinedQuestion.find({ location: { $in: locations },})// Assuming you want to populate user data
    res.status(200).json(responses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update user response
const updateAll = async (req, res) => {
  try {
    const location = "66df7372e2fe86332f1ad7c5";

    const result = await PredefinedQuestion.updateMany(
      { $set: { location: location } } 
    );
  } catch (error) {
    console.error("Error updating temperature readings:", error);
  }
};
const updatePredefinedQuestion = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const response = await PredefinedQuestion.findById(id);
    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }

    for (const [question, answers] of Object.entries(updatedData.responses)) {
      const existingQuestion = response.responses.find(r => r.question === question);
      if (existingQuestion) {
        existingQuestion.answers = { ...existingQuestion.answers, ...answers }; // Merge answers
      } else {
        response.responses.push({ question, answers });
      }
    }

    await response.save();
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports={
 addPredefinedQuestion,updatePredefinedQuestion,
 getPredefinedQuestion,
 addPredefinedQuestionInBulk
}