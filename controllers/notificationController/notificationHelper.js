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
