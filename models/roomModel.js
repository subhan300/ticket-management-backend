const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  SKU: { type: String, required: true },
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
  userItems:[{type:Schema.Types.ObjectId,ref:"UserItem"}],
  tickets:[{type:Schema.Types.ObjectId,ref:"Ticket"}],
  laundaryTickets:[{type:Schema.Types.ObjectId,ref:"LaundryTicket"}],
  type:{type:String,default:"general",required:false}
});

// Create and export the Unit model
module.exports = mongoose.model("Room", roomSchema);
