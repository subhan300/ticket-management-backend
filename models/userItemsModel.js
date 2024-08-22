const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserItemSchema = new Schema({
  itemName: String,
  category: String,
  size: String,
  color: String,
  itemImage:String,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  SKU:String
});

const UserItem = mongoose.model('UserItem', UserItemSchema);
module.exports = UserItem;
