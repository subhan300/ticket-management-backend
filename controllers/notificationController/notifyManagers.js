
const connectedUsers = require("../../utils/store-data/connectedUsers");
const { createNotification } = require("./createNotification");
const { sendSocketNotification } = require("./sendSocketNotification");


const notifyManagers = async (
    req,
    name,
    ticket,
    managersCollection,
    messageHandler,category
  ) => {
    const { ticketNo, _id: ticketId, assignedTo } = ticket;
    for (const managerId of managersCollection) {
      console.log("manager",managerId,"connected",connectedUsers)
      const socketId = connectedUsers[managerId];
      const message = messageHandler(name, assignedTo.name,ticketNo);
      const notifyRes = await createNotification(managerId, message, ticketId,category);
      sendSocketNotification(req, socketId, notifyRes);
    }
  };

  
module.exports={notifyManagers}