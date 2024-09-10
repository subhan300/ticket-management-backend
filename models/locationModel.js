// unit.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the Unit schema
const LocationSchema = new Schema({
  locationName: { type: String, required: true },
  company: { type: Schema.Types.ObjectId, ref: "company" },
  // unit: [{ type: Schema.Types.ObjectId, ref: "unit" }],
});

module.exports = mongoose.model("Location", LocationSchema);
