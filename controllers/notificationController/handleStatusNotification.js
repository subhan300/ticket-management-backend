
const {
  updateTicketAssignedMessage,
  updateStatusMessage,
  updateTicketStatusMessage,

} = require("../../utils");
const { NotAssignedId, MANAGER, USER, TECHNICIAN,  } = require("../../utils/constants");
const connectedUsers = require("../../utils/store-data/connectedUsers");
const { createNotification } = require("./createNotification");
const { sendSocketNotification } = require("./sendSocketNotification");
const {notifyAssignedUserAboutStatus} =require("./notifyAssignedUsersAboutStatus")
const {notifyManagersAboutStatus} =require("./notifyManagersAboutStatus")


const handleStatusNotification = async (
    req,
    updates,
    managersCollection,
    ticket,category
  ) => {
    const { status, } = updates;
    const assignedTo=ticket.assignedTo._id
    const { role, name,id ,roles} = req.user;
    if (roles.includes(USER) && status) {
     
      if (assignedTo._id !== NotAssignedId) {
        await notifyAssignedUserAboutStatus(ticket, req,category);
      }
      if (managersCollection.length)
        await notifyManagersAboutStatus(
          req,
          name,
          ticket,
          managersCollection,
          updateTicketAssignedMessage,category
        );
    }
  
    if (roles.includes(MANAGER) && assignedTo !== NotAssignedId) {
      console.log("here right ")
      await notifyAssignedUserAboutStatus(ticket, req,category);
       
      if(ticket.userId._id.toString() !== id ){
        console.log("here come userdi ====>",ticket.userId._id.toString(),"---",id)
        const userSocketId = connectedUsers[ticket.userId._id];
        const notifyRes = await await createNotification(
          ticket.userId._id,
          updateTicketStatusMessage(name, ticket.status,ticket.ticketNo),
          updates._id,category
        );
        sendSocketNotification(req, userSocketId, notifyRes);
      }
    }
    if (roles.includes(MANAGER) && assignedTo === NotAssignedId) {
      console.log("here NOT ASSIGNED right ")
      if(ticket.userId._id.toString() !== id){
        const userSocketId = connectedUsers[ticket.userId._id];
        const notifyRes = await await createNotification(
          ticket.userId._id,
          updateTicketStatusMessage(name, ticket.status,ticket.ticketNo),
          updates._id,category
        );
        sendSocketNotification(req, userSocketId, notifyRes);
      }
    }
  
    if (roles.includes(TECHNICIAN) && assignedTo !== NotAssignedId) {
      const userSocketId = connectedUsers[ticket.userId._id];
      const notifyRes = await createNotification(
        ticket.userId._id,
        updateStatusMessage(name, ticket.status,ticket.ticketNo),
        updates._id,category
      );
      sendSocketNotification(req, userSocketId, notifyRes);
  
      if (managersCollection.length)
        await notifyManagersAboutStatus(req, name, ticket, managersCollection,category);
    }
  };
  
  
  module.exports={handleStatusNotification}