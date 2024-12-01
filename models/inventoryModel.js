const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const inventorySchema = new Schema(
  {
    location: { type: Schema.Types.ObjectId, ref: "Location" },
    inventoryUsed: [
      {
        ticket: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ticket",
          // unique: true,
        },
        ticketNo: { type: String },
        updatedDate: { type: String },
        usedBy: { type: String },
        room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
 
        role: { type: String },
        roles: [{ type: String }],
        usedItemQty: { type: Number, default: 0 },
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
    receivingHistory: [
      {
        receivedDate: { type: Date, required: true },
        receivedQty: { type: Number, required: true }, 
        receivedBy: { type: String, required: true }, 
        price:{type:Number},
        warrant:{type:String},
        selectedRooms:[ {
          room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }, // Reference to Room model
          roomName: String, // To store room name, but it's optional since we can populate it
          quantity: Number, // Quantity for the room
        }],
        // room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },

      },
    ],
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

    selectedRooms:[ {
      room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }, // Reference to Room model
      roomName: String, // To store room name, but it's optional since we can populate it
      quantity: Number, // Quantity for the room
    }],
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    softDelete:{type:Boolean,default:false},
    status: {
      type: String,
      enum: ["In Stock", "Out of Stock", "Low Stock"],
      default: "In Stock",
    },
    condition: { type: String },
    supplier:{  type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,},
    expireDate: { type: Date },
    warrantyPeriod: { type: Date },
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
  inventorySchema.set('toJSON', { virtuals: true });
  inventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Inventory", inventorySchema);
