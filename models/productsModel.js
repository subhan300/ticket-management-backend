const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    price:{type:Number,required:true},
    SKU: { type: String, required: true },
    productName: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
      required: false,
    },

    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: "string",
      required: false,
    },
    location:{type: mongoose.Schema.Types.ObjectId, ref: "Location",required:true},

    category: {
      type: String,
      required: true,
    },

  },
  { timestamps: true },
  
);




module.exports = mongoose.model("Product", productSchema);
