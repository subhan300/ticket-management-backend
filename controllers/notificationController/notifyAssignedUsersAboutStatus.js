const { updateStatusMessage } = require("../../utils");

const connectedUsers = require("../../utils/store-data/connectedUsers");
const { createNotification } = require("./createNotification");
const { sendSocketNotification } = require("./sendSocketNotification");

const notifyAssignedUserAboutStatus = async (ticket, req,category) => {
  const { name } = req.user;
  const { assignedTo, _id: ticketId,location:{_id,locationName} } = ticket;
  const socketId = connectedUsers[assignedTo?._id];
  const message = updateStatusMessage(name, ticket.status,ticket.ticketNo,locationName);

  const notifyRes = await createNotification(
    assignedTo?._id, message,ticketId,
  category,_id
  );
  sendSocketNotification(req, socketId, notifyRes);
};

module.exports = { notifyAssignedUserAboutStatus };
