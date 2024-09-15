const {  updateStatusMessage,} = require("../../utils");
const connectedUsers = require("../../utils/store-data/connectedUsers");
const { createNotification } = require("./createNotification");
const { sendSocketNotification } = require("./sendSocketNotification");


const notifyManagersAboutStatus = async (
    req,
    name,
    ticket,
    managersCollection,
    messageHandler
  ) => {
    const { ticketNo, _id: ticketId, assignedTo } = ticket;
    for (const managerId of managersCollection) {
      const socketId = connectedUsers[managerId];
      const message = updateStatusMessage(name, ticket.status);
      // console.log("manager", socketId, "managerid", managerId);
      const notifyRes = await createNotification(managerId, message, ticketId);
      sendSocketNotification(req, socketId, notifyRes);
    }
  };

module.exports={notifyManagersAboutStatus }