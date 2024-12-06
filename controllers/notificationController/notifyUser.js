
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
    const { ticketNo, _id: ticketId, assignedTo } = ticket;
    for (const userId of usersCollection) {
      const socketId = connectedUsers[userId];
      const message = messageHandler(name,roles,ticketNo,);
      const notifyRes = await createNotification(userId, message, ticketId,category);
      sendSocketNotification(req, socketId, notifyRes);
    }
  };

  
  module.exports={notifyUsers}