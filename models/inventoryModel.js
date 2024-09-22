const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const inventorySchema = new Schema(
  {
    location: { type: Schema.Types.ObjectId, ref: "Location" },
    inventoryUsed: [
      {
        // ticket: {
        //   type: mongoose.Schema.Types.ObjectId,
        //   ref: "Ticket",
        //   // unique: true,
        // },
        // ticketNo: { type: String },
        // updatedDate: { type: String },
        // usedBy: { type: String },
        // room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
 
        // role: { type: String },
        // usedItemQty: { type: Number, default: 0 },
      },
    ],
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
      required: true,
    },
    price: { type: Number, required: true },
    SKU: { type: String, required: false,unique:true },
    productName: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit" },
    brand: {
      type: String,
      required: false,
    },
    modelNo: {
      type: String,
      required: false,
    },
    size: {
      type: String,
      required: false,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    usedItem: {
      type: Number,
      required: false,
      default: 0,
    },

    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["In Stock", "Out of Stock", "Low Stock"],
      default: "In Stock",
    },
    condition: { type: String },
    supplierName: { type: String },
    supplierCotactNo: { type: String },
    expireDate: { type: Date },
    warranty: { type: String },

    threshold: {
      type: Number,
      default: 10,
    },
    purchaseDate: {
      type: Date,
      // default: Date.now,
    },
  },

  { timestamps: true }
);
inventorySchema.virtual("availableQty").get(function () {
  return this.quantity - this.usedItem;
});

//   // Ensure virtual fields are included in toJSON and toObject outputs
//   inventorySchema.set('toJSON', { virtuals: true });
//   inventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Inventory", inventorySchema);
