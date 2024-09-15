
const connectedUsers = require("../../utils/store-data/connectedUsers");
const { createNotification } = require("./createNotification");
const { sendSocketNotification } = require("./sendSocketNotification");



const notifyUsers = async (
    req,
    name,
    ticket,
    usersCollection,
    messageHandler
  ) => {
      const { role, } = req.user;
      console.log("role===",role)
    const { ticketNo, _id: ticketId, assignedTo } = ticket;
    for (const userId of usersCollection) {
      console.log("notify func run =====user====",userId)
      const socketId = connectedUsers[userId];
      const message = messageHandler(name,role);
      const notifyRes = await createNotification(userId, message, ticketId);
      sendSocketNotification(req, socketId, notifyRes);
    }
  };

  
  module.exports={notifyUsers}