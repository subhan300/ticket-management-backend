import mongoose from "mongoose";

export const commentSchema = new mongoose.Schema({
    isSystemGenerated:{type:Boolean,default:false},
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    images: [{
      type: String,
    }],
    files: [{
      type: String,
    }],
    createdAt: {
      type: Date,
      // default: Date.now,
    }
  });


export const inventoryUsedSchema = new mongoose.Schema({
  inventoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true,
  },
  quantityUsed: {
    type: Number,
    required: true,
  }
});