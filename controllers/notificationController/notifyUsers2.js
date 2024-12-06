
const connectedUsers = require("../../utils/store-data/connectedUsers");
const { createNotification } = require("./createNotification");
const { sendSocketNotification } = require("./sendSocketNotification");




// we will make this one for all places and remove notificatonuser in future
const notifyUsers2 = async (
    req,
    name,
    ticket,
    usersCollection,
    message,category
  ) => {
      const { role, } = req.user;
    const { _id: ticketId} = ticket;
    for (const userId of usersCollection) {
      const socketId = connectedUsers[userId];
     
      const notifyRes = await createNotification(userId, message, ticketId,category);
      sendSocketNotification(req, socketId, notifyRes);
    }
  };

  
  module.exports={notifyUsers2}