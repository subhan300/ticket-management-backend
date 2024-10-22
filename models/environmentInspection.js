const mongoose = require('mongoose');

const environmentCheckListSchema = new mongoose.Schema({
  month: { type: String },
  week: { type: String },
  year:{type:String},
  checkList: [{
    category: {
      type: String,
      required: true,
    },
    questions: [{
      question: { type: String, required: true },
      answers: {
        type: Map,
        of: String // This allows for storing { "Mon": "yes", "Tue": "no", etc. }
      }
    }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('environmentCheckList', environmentCheckListSchema);
