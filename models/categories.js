const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  type: { type: String },
  category: {
    type: String,
    required: true,
  },
  sizes: [String], 
});

module.exports = mongoose.model("Categories", categorySchema);
