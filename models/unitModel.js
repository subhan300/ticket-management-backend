const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UnitSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  rooms: { type: Array },
  company: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  location: { type: Schema.Types.ObjectId, ref: "Location", required: true },
});

module.exports = mongoose.model("Unit", UnitSchema);
