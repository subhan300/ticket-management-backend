
const connectedUsers = require("../../utils/store-data/connectedUsers");
const { createNotification } = require("./createNotification");
const { sendSocketNotification } = require("./sendSocketNotification");



const notifyUsers = async (
    req,
    name,
    ticket,
    usersCollection,
    messageHandler,category
  ) => {
      const { roles, } = req.user;
    const { ticketNo, _id: ticketId, assignedTo ,location} = ticket;
    console.log("location=====",location)
    for (const userId of usersCollection) {
      const socketId = connectedUsers[userId];
      const message = messageHandler(name,roles,ticketNo,location.locationName);
      const notifyRes = await createNotification(userId, message, ticketId,category,location._id);
      sendSocketNotification(req, socketId, notifyRes);
    }
  };

  
  module.exports={notifyUsers}