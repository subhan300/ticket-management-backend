
const {
  updateTicketAssignedMessage,
  updateStatusMessage,
  updateTicketStatusMessage,

} = require("../../utils");
const { NotAssignedId,  } = require("../../utils/constants");
const connectedUsers = require("../../utils/store-data/connectedUsers");
const { createNotification } = require("./createNotification");
const { sendSocketNotification } = require("./sendSocketNotification");
const {notifyAssignedUserAboutStatus} =require("./notifyAssignedUsersAboutStatus")
const {notifyManagersAboutStatus} =require("./notifyManagersAboutStatus")


const handleStatusNotification = async (
    req,
    updates,
    managersCollection,
    ticket
  ) => {
    const { status } = updates;
    const { assignedTo } = ticket;
    const { role, name } = req.user;
    if (role === "USER" && status) {
     
      if (assignedTo._id !== NotAssignedId) {
        await notifyAssignedUserAboutStatus(ticket, req);
      }
      if (managersCollection.length)
        await notifyManagersAboutStatus(
          req,
          name,
          ticket,
          managersCollection,
          updateTicketAssignedMessage
        );
    }
  
    if (role === "MANAGER" && assignedTo !== NotAssignedId) {
      await notifyAssignedUserAboutStatus(ticket, req);
      const userSocketId = connectedUsers[ticket.userId._id];
      // console.log(
      //   "user socket",
      //   userSocketId,
      //   "connected",
      //   connectedUsers,
      //   "ticket suer",
      //   ticket.userId._id
      // );
      const notifyRes = await await createNotification(
        ticket.userId._id,
        updateTicketStatusMessage(name, ticket.status),
        updates._id
      );
      sendSocketNotification(req, userSocketId, notifyRes);
    }
  
    if (role === "TECHNICIAN" && assignedTo !== NotAssignedId) {
      const userSocketId = connectedUsers[ticket.userId._id];
      const notifyRes = await createNotification(
        ticket.userId._id,
        updateStatusMessage(name, ticket.status),
        updates._id
      );
      sendSocketNotification(req, userSocketId, notifyRes);
  
      if (managersCollection.length)
        await notifyManagersAboutStatus(req, name, ticket, managersCollection);
    }
  };
  
  
  module.exports={handleStatusNotification}