
const { TECHNICIAN, LaundryOperator, } = require("../../utils/constants");
const connectedUsers = require("../../utils/store-data/connectedUsers");
const { createNotification } = require("./createNotification");
const { sendSocketNotification } = require("./sendSocketNotification");



const notifyAssignedUser = async (ticket, req,category) => {
    const { role, name } = req.user;
    const { assignedTo, _id: ticketId } = ticket;
  
    const socketId = connectedUsers[assignedTo._id];
    const message =
      role === TECHNICIAN  || role === LaundryOperator
        ? `You have been assigned a new ticket`
        : `Ticket is assigned by ${
            role === "MANAGER" ? "Manager" : "Technician"
          } ${name} to ${assignedTo.name}`;
    console.log("assigngedto====", assignedTo._id, "sockt==", socketId);
  
    const notifyRes = await createNotification(assignedTo._id, message, ticketId,category);
    sendSocketNotification(req, socketId, notifyRes);
  };


  module.exports={ notifyAssignedUser}