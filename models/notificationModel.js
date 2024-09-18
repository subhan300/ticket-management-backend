const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  archieve:{type:Boolean,default:false},
  category:{type:String,required:true}
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
