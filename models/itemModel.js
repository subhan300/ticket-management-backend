const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = new Schema({
  item: {
    type: String,
    required: true,
  },
  itemImage: {
    type: String,
    required: false,
  },

  issues: {
    type: Array,
    required: false,
  },
  category: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Item", itemSchema);
