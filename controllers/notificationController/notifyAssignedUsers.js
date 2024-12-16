
const { TECHNICIAN, LaundryOperator, MANAGER, } = require("../../utils/constants");
const connectedUsers = require("../../utils/store-data/connectedUsers");
const { createNotification } = require("./createNotification");
const { sendSocketNotification } = require("./sendSocketNotification");



const notifyAssignedUser = async (ticket, req,category) => {
    const { roles, name } = req.user;
    const { assignedTo, _id: ticketId,location:{_id,locationName} } = ticket;
  
    const socketId = connectedUsers[assignedTo._id];
    const message =
      roles.includes(TECHNICIAN)  || roles.includes(LaundryOperator)
        ? `You have been assigned a new ticket of location ${locationName}`
        : `Ticket is assigned by ${
          roles.includes(MANAGER)? "Manager" : "Technician"
          } ${name} to ${assignedTo.name} of location ${locationName}`;
  
    const notifyRes = await createNotification(assignedTo._id, message, ticketId,category,_id);
    sendSocketNotification(req, socketId, notifyRes);
  };


  module.exports={ notifyAssignedUser}