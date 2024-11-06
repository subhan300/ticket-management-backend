const { default: mongoose } = require("mongoose");
const Notification = require("../../models/notificationModel");



const createNotification = async (userId, message, ticketId,category) => {
    try {
      console.log("create time user id==",userId)
      console.log("whilte creating....",userId, message, ticketId,"category====>",category)
      const notification = new Notification({
        userId,
        message,
        ticketId:  mongoose.Types.ObjectId.isValid(ticketId) ? new mongoose.Types.ObjectId(ticketId): null,
        category
      });
      const savedNotification = await notification.save();
      console.log("saved====", savedNotification);
      return savedNotification;
    } catch (error) {
      console.error("Error saving notification:", error);
    }
  };


  module.exports={createNotification}