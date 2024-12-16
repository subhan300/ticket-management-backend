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
    const { ticketNo, _id: ticketId,location:{_id,locationName} } = ticket;
    for (const managerId of managersCollection) {
      const socketId = connectedUsers[managerId];
      const message = updateStatusMessage(name, ticket.status,ticketNo,locationName);
      // console.log("manager", socketId, "managerid", managerId);
      const notifyRes = await createNotification(managerId, message, ticketId,category,_id);
      sendSocketNotification(req, socketId, notifyRes);
    }
  };

module.exports={notifyManagersAboutStatus }