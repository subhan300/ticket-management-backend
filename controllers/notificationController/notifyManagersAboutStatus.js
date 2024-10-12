const {  updateStatusMessage,} = require("../../utils");
const connectedUsers = require("../../utils/store-data/connectedUsers");
const { createNotification } = require("./createNotification");
const { sendSocketNotification } = require("./sendSocketNotification");


const notifyManagersAboutStatus = async (
    req,
    name,
    ticket,
    managersCollection,
    category
  ) => {
    const { ticketNo, _id: ticketId, } = ticket;
    for (const managerId of managersCollection) {
      const socketId = connectedUsers[managerId];
      const message = updateStatusMessage(name, ticket.status,ticketNo);
      // console.log("manager", socketId, "managerid", managerId);
      const notifyRes = await createNotification(managerId, message, ticketId,category);
      sendSocketNotification(req, socketId, notifyRes);
    }
  };

module.exports={notifyManagersAboutStatus }