const Notification = require("../../models/notificationModel");
const {
  managerUpdateTicketAssignedMessage,
  updateTicketAssignedMessage,
  technicianUpdateTicketAssignedMessage,
  updateStatusMessage,
  ticketCreateMessage,
  laundaryCreateMessage,
  ticketUnAssignedMessage,
} = require("../../utils");
const { TECHNICIAN, NotAssignedId, MANAGER, LaundryOperator } = require("../../utils/constants");
const connectedUsers = require("../../utils/store-data/connectedUsers");

// Helper function to create and save a notification
const createNotification = async (userId, message, ticketId) => {
  try {
    console.log("create time user id==",userId)
    const notification = new Notification({
      userId,
      message,
      ticketId,
    });
    const savedNotification = await notification.save();
    // console.log("saved====", savedNotification);
    return savedNotification;
  } catch (error) {
    console.error("Error saving notification:", error);
  }
};
// Helper function to send a socket notification
const sendSocketNotification = (req, socketId, notifyRes) => {
  try {
    console.log("socket while sending id===",socketId);
    req.io.to(socketId).emit("ticket", notifyRes);
  } catch (err) {
    console.log(err);
  }
};
// Function to handle notifications for assigned users
const notifyAssignedUser = async (ticket, req) => {
  const { role, name } = req.user;
  const { assignedTo, _id: ticketId } = ticket;

  const socketId = connectedUsers[assignedTo._id];
  const message =
    role === TECHNICIAN
      ? `You have been assigned a new ticket`
      : `Ticket is assigned by ${
          role === "MANAGER" ? "Manager" : "Technician"
        } ${name} to ${assignedTo.name}`;
  console.log("assigngedto====", assignedTo._id, "sockt==", socketId);

  const notifyRes = await createNotification(assignedTo._id, message, ticketId);
  sendSocketNotification(req, socketId, notifyRes);
};

const notifyUsers = async (
  req,
  name,
  ticket,
  usersCollection,
  messageHandler
) => {
    const { role, } = req.user;
    console.log("role===",role)
  const { ticketNo, _id: ticketId, assignedTo } = ticket;
  for (const userId of usersCollection) {
    console.log("notify func run =====user====",userId)
    const socketId = connectedUsers[userId];
    const message = messageHandler(name,role);
    const notifyRes = await createNotification(userId, message, ticketId);
    sendSocketNotification(req, socketId, notifyRes);
  }
};

const notifyAssignedUserAboutStatus = async (ticket, req) => {
  const { role, name } = req.user;
  const { assignedTo, _id: ticketId } = ticket;
  const socketId = connectedUsers[assignedTo?._id];
  const message = updateStatusMessage(name, ticket.status);

  const notifyRes = await createNotification(assignedTo?._id, message, ticketId);
  sendSocketNotification(req, socketId, notifyRes);
};
// Function to notify managers
const notifyManagers = async (
  req,
  name,
  ticket,
  managersCollection,
  messageHandler
) => {
  const { ticketNo, _id: ticketId, assignedTo } = ticket;
  for (const managerId of managersCollection) {
    const socketId = connectedUsers[managerId];
    const message = messageHandler(name, assignedTo.name);
    const notifyRes = await createNotification(managerId, message, ticketId);
    sendSocketNotification(req, socketId, notifyRes);
  }
};

const notifyManagersAboutStatus = async (
  req,
  name,
  ticket,
  managersCollection,
  messageHandler
) => {
  const { ticketNo, _id: ticketId, assignedTo } = ticket;
  for (const managerId of managersCollection) {
    const socketId = connectedUsers[managerId];
    const message = updateStatusMessage(name, ticket.status);
    // console.log("manager", socketId, "managerid", managerId);
    const notifyRes = await createNotification(managerId, message, ticketId);
    sendSocketNotification(req, socketId, notifyRes);
  }
};
const handleNotification = async (req, updates, managersCollection,users, ticket) => {
  const { assignedTo, status } = updates;
  //   console.log("udpates====",updates,"",status)
  if (assignedTo && status) {
    handleStatusNotification(req, updates, managersCollection, ticket);
    handleAssignedNotifications(req, updates, managersCollection,users, ticket);
    return;
  } else if (assignedTo) {
    handleAssignedNotifications(req, updates, managersCollection,users, ticket);
    return;
  } else if (status) {
    // console.log("status==");
    handleStatusNotification(req, updates, managersCollection, ticket);
    return;
  }
};
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
      updateStatusMessage(name, ticket.status),
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
    await notifyAssignedUser(ticket, req);
    const userSocketId = connectedUsers[ticket.userId._id];
    console.log("user===", userSocketId < "ticket.userId", ticket.userId);
    const notifyRes = await createNotification(
      ticket.userId._id,
      managerUpdateTicketAssignedMessage(name, ticket.assignedTo.name),
      updates._id
    );
    sendSocketNotification(req, userSocketId, notifyRes);
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

const handleTicketNotification = async (
  req,
  managersCollection,
  technicians,
  ticket
) => {
  
  const { role, name } = req.user;
  if (role === "USER") {
    // console.log("mamagers",managersCollection,"tech-",technicians)
    if (technicians.length) {
      await notifyUsers(req, name, ticket, technicians, ticketCreateMessage);
    }
    if (managersCollection.length)
      await notifyUsers(
        req,
        name,
        ticket,
        managersCollection,
        ticketCreateMessage
      );
  }
// here technician means laundary operator
  if (role === "MANAGER" && technicians.length) {
    console.log("collection of ",technicians,"name",name)
    await notifyUsers(req, name, ticket, technicians, ticketCreateMessage);
  }
 
  if(role===LaundryOperator){
   
    if (managersCollection.length)
      await notifyUsers(
        req,
        name,
        ticket,
        managersCollection,
        ticketCreateMessage
      );
  }
};
module.exports = { handleNotification,handleTicketNotification };
