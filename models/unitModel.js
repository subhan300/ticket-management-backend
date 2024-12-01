const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UnitSchema = new Schema({
  softDelete:{type:Boolean,default:false},
  name: {
    type: String,
    required: true,
  },
  location: { type: Schema.Types.ObjectId, ref: "Location", required: true },
});

module.exports = mongoose.model("Unit", UnitSchema);
