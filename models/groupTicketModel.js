const mongoose = require("mongoose");
const { OPEN,} = require("../utils/constants");
const { commentSchema, inventoryUsedSchema } = require("./HelperSchemas");

const ticketSchema = new mongoose.Schema(
  {
    isSheduled:{type:Boolean,default:false},
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
    units:[{type: mongoose.Schema.Types.ObjectId, ref: "Room",required:true}],
    rooms:[{type: mongoose.Schema.Types.ObjectId, ref: "Room",required:true}],
    location:{type: mongoose.Schema.Types.ObjectId, ref: "Location",required:true},
    assignedTo: [{ type: mongoose.Schema.Types.Mixed, ref: "User", required: false }],
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
      // enum: [OPEN,PROGRESS,BLOCKED,CLOSED,COMPLETED],
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

const GroupTicket = mongoose.model("GroupTicket", ticketSchema);


  
module.exports = GroupTicket;
