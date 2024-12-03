const mongoose = require('mongoose');

const PredefinedQuestionSchema = new mongoose.Schema({
  location:{type: mongoose.Schema.Types.ObjectId, ref: "Location",required:true},
  category: {
    type: String,
    required: true
  },
  questions: [
    {
      type: String,
      required: true
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('PredefinedQuestion', PredefinedQuestionSchema);
