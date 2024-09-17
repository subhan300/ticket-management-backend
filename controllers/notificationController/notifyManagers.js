
const connectedUsers = require("../../utils/store-data/connectedUsers");
const { createNotification } = require("./createNotification");
const { sendSocketNotification } = require("./sendSocketNotification");


const notifyManagers = async (
    req,
    name,
    ticket,
    managersCollection,
    messageHandler
  ) => {
    const { ticketNo, _id: ticketId, assignedTo } = ticket;
    for (const managerId of managersCollection) {
      const socketId = connectedUsers[managerId];
      const message = messageHandler(name, assignedTo.name);
      const notifyRes = await createNotification(managerId, message, ticketId,ticketNo);
      sendSocketNotification(req, socketId, notifyRes);
    }
  };

  
module.exports={notifyManagers}