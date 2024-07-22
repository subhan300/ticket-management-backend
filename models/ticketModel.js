const mongoose = require("mongoose");
const { OPEN, PROGRESS, BLOCKED, CLOSED, COMPLETED } = require("../utils/constants");
const commentSchema = new mongoose.Schema({
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
const ticketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"company",
      required:true,
    },
    comments: [commentSchema], // Embed the comment schema
    issueLocation:{
      locationName:{type:String},
      unit:{type:Object},
      room:{type:String},
      extraDetail:{type:String}
    },
    assignedTo: { type: mongoose.Schema.Types.Mixed, ref: "User", required: false },
    issue: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
    },

    status: {
      type: String,
      enum: [OPEN,PROGRESS,BLOCKED,CLOSED,COMPLETED],
      default: OPEN,
    },
    createdAt: {
      type: Date,
      // default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

ticketSchema.virtual('assignedToDetails', {
  ref: 'User',
  localField: 'assignedTo',
  foreignField: '_id',
  justOne: true,
  options: {
    select: 'name email',
  },
});
  
module.exports = Ticket;
