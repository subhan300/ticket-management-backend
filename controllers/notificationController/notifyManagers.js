
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
    const { ticketNo, _id: ticketId, assignedTo ,location:{_id,locationName}} = ticket;
    for (const managerId of managersCollection) {
      const socketId = connectedUsers[managerId];
      const message = messageHandler(name, assignedTo.name,ticketNo,locationName);
      const notifyRes = await createNotification(managerId, message, ticketId,category,_id);
      sendSocketNotification(req, socketId, notifyRes);
    }
  };

  
module.exports={notifyManagers}