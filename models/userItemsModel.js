const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserItemSchema = new Schema({
  itemName: String,
  category: String,
  size: String,
  color: String,
  itemImage:String,
  room:{type:Schema.Types.ObjectId,ref:"Room",required:true},
  // unit:{type: Schema.Types.ObjectId, ref: 'Unit',required:true },
  // locationName:{type:String},
  SKU:String
});

const UserItem = mongoose.model('UserItem', UserItemSchema);
module.exports = UserItem;
