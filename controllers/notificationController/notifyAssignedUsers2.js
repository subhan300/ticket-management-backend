const { TECHNICIAN, LaundryOperator } = require("../../utils/constants");
const connectedUsers = require("../../utils/store-data/connectedUsers");
const { createNotification } = require("./createNotification");
const { sendSocketNotification } = require("./sendSocketNotification");

const notifyAssignedUser2 = async (ticket, req, message,category) => {
  const { assignedTo, _id: ticketId ,location:{_id,locationName}} = ticket;

  const socketId = connectedUsers[assignedTo._id];

  const notifyRes = await createNotification(assignedTo._id, message, ticketId,category,_id);
  sendSocketNotification(req, socketId, notifyRes);
};

module.exports = { notifyAssignedUser2 };
