const mongoose = require('mongoose');

const environmentCheckListSchema = new mongoose.Schema({
  month: { type: String },
  week: { type: String },
  location:{type: mongoose.Schema.Types.ObjectId, ref: "Location",required:true},
  year:{type:String},
  checkList: [{
    category: {
      type: String,
      required: true,
    },
    questions: [{
      comment:{type:String},
      staff:[{  type: mongoose.Schema.Types.ObjectId,
        ref: 'User'}],
      question: { type: String, required: true },
      answers: {
        type: Map,
        of: String // This allows for storing { "Mon": "yes", "Tue": "no", etc. }
      }
    }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('environmentCheckList', environmentCheckListSchema);
