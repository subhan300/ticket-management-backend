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
      // console.log("ticket===",ticket)
    const { assignedTo, status } = updates;
    console.log("assigned to",assignedTo,ticket._id,ticket.ticketNO)
    const technicianSocketId = connectedUsers[assignedTo];
    const { roles, name } = req.user;
    if (roles.includes(USER) && assignedTo) {
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
    
    if (roles.includes(MANAGER) && assignedTo !== NotAssignedId) {
      console.log("manger====",category)
      await notifyAssignedUser2(ticket, req,messageToAssignedUser(ticket.ticketNo),category);
     
    }
    if (roles.includes(MANAGER) && assignedTo === NotAssignedId) {
      console.log("here==>",usersCollection)
      const technicians = await getAllUsersByRole(ticket.companyId, TECHNICIAN);
     if(technicians.length){
         await notifyUsers(req,
          name,
          ticket,
          technicians,
          ticketUnAssignedMessage,category);
     }
     
    }
  
  
    if (roles.includes(TECHNICIAN) && assignedTo !== NotAssignedId) {
      const userSocketId = connectedUsers[ticket.userId._id];
       console.log("ticket iserid twhxcnian",ticket.userId)
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
    if (roles.includes(TECHNICIAN) && assignedTo === NotAssignedId) {
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

     if (roles.includes(LaundryOperator)) {
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