const mongoose = require("mongoose");
const { OPEN, PROGRESS, BLOCKED, CLOSED, COMPLETED } = require("../utils/constants");
const commentSchema = new mongoose.Schema({
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


const inventoryUsedSchema = new mongoose.Schema({
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
const ticketSchema = new mongoose.Schema(
  {
    ticketNo:{type:String,},
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy:{type: mongoose.Schema.Types.ObjectId,
      ref: "User",},
    companyId:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"company",
      required:true,
    },
    archieve:{type:Boolean,default:false},
    comments: [commentSchema], // Embed the comment schema
    inventoryUsed: [inventoryUsedSchema],
    externalInventory:{type:String,default:"Not Ordered anything Externally"},
    room:{type: mongoose.Schema.Types.ObjectId, ref: "Room",required:true},
    location:{type: mongoose.Schema.Types.ObjectId, ref: "Location",required:true},
    assignedTo: { type: mongoose.Schema.Types.Mixed, ref: "User", required: false },
    issue: {
      type: String,
      required: true,
    },
    issueItem:{type:String},
    issueItemDescription:{type:String},
    dueDate:{type:Date,},
    audit:{type:Boolean,default:false},
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
  },
  

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
