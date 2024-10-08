const mongoose = require("mongoose");
const {
  HIGH,
  MEDIUM,
  LOW,
  LAUNDRY_STATUS,
  LAUNDRY_PRIORITY,
} = require("../utils/constants");

const commentSchema = new mongoose.Schema({
  isSystemGenerated: { type: Boolean, default: false },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
    },
  ],
  files: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    // default: Date.now,
  },
});

const LaundrySchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    ticketNo: { type: String },
    SKU: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userItems: [
      { type: mongoose.Schema.Types.ObjectId, ref: "UserItem", required: true },
    ],
    confirmRecieve: [
      { type: mongoose.Schema.Types.ObjectId, ref: "UserItem" }
    ],
    confirmCompleted: [
      { type: mongoose.Schema.Types.ObjectId, ref: "UserItem" } 
    ],
    quantity: { type: Number, default: 0 },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(LAUNDRY_PRIORITY),
      default: LAUNDRY_PRIORITY.LOW,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
      required: true,
    },
    archieve: { type: Boolean, default: false },
    comments: [commentSchema], // Embed the comment schema

    category: { type: String },
    assignedTo: {
      type: mongoose.Schema.Types.Mixed,
      ref: "User",
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    images: {
      type: Array,
    },

    status: {
      type: String,
      enum: Object.values(LAUNDRY_STATUS),
      default: LAUNDRY_STATUS.PICKED_UP,
    },
    createdAt: {
      type: Date,
      // default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const LaundryTicket = mongoose.model("LaundryTicket", LaundrySchema);

LaundrySchema.virtual("assignedToDetails", {
  ref: "User",
  localField: "assignedTo",
  foreignField: "_id",
  justOne: true,
  options: {
    select: "name email",
  },
});

module.exports = LaundryTicket;
