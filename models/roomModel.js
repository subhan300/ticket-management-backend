const mongoose = require("mongoose");
const UserItem = require("./userItemsModel");
const Ticket = require("./ticketModel");
const Inventory = require("./inventoryModel");
const LaundryTicket = require("./laundryModel");
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  SKU: { type: String, required: true },
  sensor: { type: String },
  resident: { type: Schema.Types.ObjectId, ref: "User" },
  softDelete: { type: Boolean, default: false },
  roomName: {
    type: String,
    required: true,
  },
  unit: {
    type: Schema.Types.ObjectId,
    ref: "Unit",
    required: true,
  },
  location: { type: Schema.Types.ObjectId, ref: "Location", required: true },
  userItems: [{ type: Schema.Types.ObjectId, ref: "UserItem" }],
  tickets: [{ type: Schema.Types.ObjectId, ref: "Ticket" }],
  laundaryTickets: [{ type: Schema.Types.ObjectId, ref: "LaundryTicket" }],
  type: { type: String, default: "general", required: false },
});



module.exports = mongoose.model("Room", roomSchema);
