// stockItem.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the StockItem schema
const StockItemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  quantity: { type: Number, required: true },
  price: {
    type: Number,
    required: true,
  },
  purchaseDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  status:{
    type:String,
    enum:["inStock","outOfStock"],
    required:true
  }
});

// Create and export the StockItem model
module.exports = mongoose.model("StockItem", StockItemSchema);
