const {
  managerUpdateTicketAssignedMessage,
  updateTicketAssignedMessage,
  technicianUpdateTicketAssignedMessage,
  ticketUnAssignedMessage,
} = require("../../utils");
const { TECHNICIAN, NotAssignedId, MANAGER, } = require("../../utils/constants");
const { messageToAssignedUser } = require("../../utils/notificationMessages");
const connectedUsers = require("../../utils/store-data/connectedUsers");
const { createNotification } = require("./createNotification");
const { notifyAssignedUser } = require("./notifyAssignedUsers");
const { notifyAssignedUser2 } = require("./notifyAssignedUsers2");
const { notifyManagers } = require("./notifyManagers");
const { notifyUsers } = require("./notifyUser");
const { sendSocketNotification } = require("./sendSocketNotification");



const handleAssignedNotifications = async (
    req,
    updates,
    managersCollection,
    usersCollection,
    ticket,
  
  ) => {
      // console.log("ticket===",ticket)
    const { assignedTo, status } = updates;
    const technicianSocketId = connectedUsers[assignedTo];
    const { role, name } = req.user;
    if (role === "USER" && assignedTo) {
      const technicianSocketId = connectedUsers[assignedTo];
      await notifyAssignedUser(ticket, req);
      if (managersCollection.length)
        await notifyManagers(
          req,
          name,
          ticket,
          managersCollection,
          updateTicketAssignedMessage
        );
    }
    
    if (role === "MANAGER" && assignedTo !== NotAssignedId) {
      console.log("manger====",ticket)
      await notifyAssignedUser2(ticket, req,messageToAssignedUser(ticket.ticketNo));
      // const userSocketId = connectedUsers[ticket.userId._id];
      // console.log("user===", userSocketId < "ticket.userId", ticket.userId);
      // const notifyRes = await createNotification(
      //   ticket.userId._id,
      //   managerUpdateTicketAssignedMessage(name, ticket.assignedTo.name),
      //   updates._id
      // );
      // const {assignedTo}=ticket
      // const userSocketId = connectedUsers[assignedTo._id];
      // console.log("user===", userSocketId < "ticket.userId", ticket.userId,"assignedTo._id",assignedTo._id);
      // const notifyRes = await createNotification(
      //   assignedTo._id,
      //   messageToAssignedUser(ticket.ticketNo),
      //   updates._id
      // );
      // sendSocketNotification(req, userSocketId, notifyRes);
    }
    if (role === MANAGER && assignedTo === NotAssignedId) {
     if(usersCollection.length){
         await notifyUsers(req,
          name,
          ticket,
          usersCollection,
          ticketUnAssignedMessage);
     }
     
    }
  
  
    if (role === TECHNICIAN && assignedTo !== NotAssignedId) {
      const userSocketId = connectedUsers[ticket.userId._id];
      const notifyRes = await createNotification(
        ticket.userId._id,
        technicianUpdateTicketAssignedMessage(name),
        updates._id
      );
      sendSocketNotification(req, userSocketId, notifyRes);
      if (managersCollection.length)
        await notifyManagers(
          req,
          name,
          ticket,
          managersCollection,
          technicianUpdateTicketAssignedMessage
        );
    }
    if (role === TECHNICIAN && assignedTo === NotAssignedId) {
      if(managersCollection.length){
          await notifyUsers(req,
           name,
           ticket,
           managersCollection,
           ticketUnAssignedMessage);
      }
      if(usersCollection.length){
          await notifyUsers(req,
           name,
           ticket,
           usersCollection,
           ticketUnAssignedMessage);
      }
      
     }
  };

  module.exports={handleAssignedNotifications}