const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsedInSchema = new Schema({
  stockItemId: {
    type: Schema.Types.ObjectId,
    ref: 'StockItem',
    required: true,
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  additionalInformation: {
    type:{name:{type:String},shortDetail:{type:String},description:{type:String}},
  },
  quantity: {
    type: Number,
    required: true,
  },
  usedDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model('StockUsedIn', UsedInSchema);
