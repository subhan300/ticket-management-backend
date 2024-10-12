const {
  updateTicketAssignedMessage,
  technicianUpdateTicketAssignedMessage,
  ticketUnAssignedMessage,
} = require("../../utils");
const { TECHNICIAN, NotAssignedId, MANAGER, LaundryOperator, USER, } = require("../../utils/constants");
const { messageToAssignedUser, broadcastAssignedMessage, broadcastUnAssignedMessage } = require("../../utils/notificationMessages");
const connectedUsers = require("../../utils/store-data/connectedUsers");
const { getAllUsersByRole } = require("../globalController/GlobalController");
const { createNotification } = require("./createNotification");
const { notifyAssignedUser } = require("./notifyAssignedUsers");
const { notifyAssignedUser2 } = require("./notifyAssignedUsers2");
const { notifyManagers } = require("./notifyManagers");
const { notifyUsers } = require("./notifyUser");
const { notifyUsers2 } = require("./notifyUsers2");
const { sendSocketNotification } = require("./sendSocketNotification");



const handleAssignedNotifications = async (
    req,
    updates,
    managersCollection,
    usersCollection,
    ticket,
    category
  
  ) => {
      console.log("ticket===",ticket)
    const { assignedTo, status } = updates;
    const technicianSocketId = connectedUsers[assignedTo];
    const { role, name } = req.user;
    if (role === USER && assignedTo) {
      const technicianSocketId = connectedUsers[assignedTo];
      await notifyAssignedUser(ticket, req,category);
      if (managersCollection.length)
        await notifyManagers(
          req,
          name,
          ticket,
          managersCollection,
          updateTicketAssignedMessage,category
        );
    }
    
    if (role === "MANAGER" && assignedTo !== NotAssignedId) {
      console.log("manger====",ticket)
      await notifyAssignedUser2(ticket, req,messageToAssignedUser(ticket.ticketNo),category);
     
    }
    if (role === MANAGER && assignedTo === NotAssignedId) {
      console.log("here",usersCollection)
      const technicians = await getAllUsersByRole(ticket.companyId, TECHNICIAN);
     if(technicians.length){
         await notifyUsers(req,
          name,
          ticket,
          technicians,
          ticketUnAssignedMessage,category);
     }
     
    }
  
  
    if (role === TECHNICIAN && assignedTo !== NotAssignedId) {
      const userSocketId = connectedUsers[ticket.userId._id];
      const notifyRes = await createNotification(
        ticket.userId._id,
        technicianUpdateTicketAssignedMessage(name,"",ticket.ticketNo),
        updates._id,category
      );
      sendSocketNotification(req, userSocketId, notifyRes);
      if (managersCollection.length)
        await notifyManagers(
          req,
          name,
          ticket,
          managersCollection,
          technicianUpdateTicketAssignedMessage,category
        );
    }
    if (role === TECHNICIAN && assignedTo === NotAssignedId) {
      if(managersCollection.length){
          await notifyUsers(req,
           name,
           ticket,
           managersCollection,
           ticketUnAssignedMessage,category);
      }
      if(usersCollection.length){
          await notifyUsers(req,
           name,
           ticket,
           usersCollection,
           ticketUnAssignedMessage,category);
      }
      
     }

     if (role === LaundryOperator) {
     if(assignedTo){
      const userSocketId = connectedUsers[assignedTo];
      const notifyRes = await createNotification(
         assignedTo,
         messageToAssignedUser(ticket.ticketNo),
        updates._id,category
      );
      sendSocketNotification(req, userSocketId, notifyRes);
     }
      
      const message=assignedTo !== NotAssignedId?broadcastAssignedMessage(name,ticket.assignedTo.name,ticket.ticketNo):broadcastUnAssignedMessage(name,"Laundary Operator",ticket.ticketNo);
      if (managersCollection.length)
       
        await notifyUsers2(
          req,
          name,
          ticket,
          managersCollection,
          message,category
          
        );
    }
   
     
  };

  module.exports={handleAssignedNotifications}