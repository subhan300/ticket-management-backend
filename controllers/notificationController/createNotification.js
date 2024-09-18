const Notification = require("../../models/notificationModel");



const createNotification = async (userId, message, ticketId,category) => {
    try {
      console.log("create time user id==",userId)
      const notification = new Notification({
        userId,
        message,
        ticketId,
        category
      });
      const savedNotification = await notification.save();
      // console.log("saved====", savedNotification);
      return savedNotification;
    } catch (error) {
      console.error("Error saving notification:", error);
    }
  };


  module.exports={createNotification}