// user.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the User schema
const UserSchema = new Schema({
  SKU: { type: String },
  softDelete:{type:Boolean,default:false},
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: false,
    // enum: ['user', 'admin'],
    // default: 'user'
  },
  roles:[{type:String}],
  password: {
    type: String,
    required: true,
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: false,
  },
// need to remove
  locationName: { type: String, required: false },
  imageUrl:{type:String,},

  locations: [{ type: Schema.Types.ObjectId, ref: "Location" }],
});

// Create and export the User model
module.exports = mongoose.model("User", UserSchema);
