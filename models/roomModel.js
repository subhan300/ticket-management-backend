const mongoose = require("mongoose");
const UserItem = require("./userItemsModel");
const Ticket = require("./ticketModel");
const Inventory=require("./inventoryModel");
const LaundryTicket = require("./laundryModel");
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  SKU: { type: String, required: true },
  sensor:{type:String},
  softDelete:{type:Boolean,default:false},
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

// roomSchema.pre('findOneAndDelete', async function (next) {
//   const roomId = this.getQuery()['_id'];

//   try {

//     const res1=await await Inventory.deleteMany({ 'selectedRooms.room': roomId });
//     const res2=await await UserItem.deleteMany({ room: roomId });
//     const res3=await await Ticket.deleteMany({ room: roomId });
//     const res4=await LaundryTicket.deleteMany({room: roomId});
//     next();
//   } catch (error) {
//     console.error('Error while deleting room and associated data:', error);
//     next(error); // Pass the error to the next middleware
//   }
// });

module.exports = mongoose.model("Room", roomSchema);
