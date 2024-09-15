const {notifyUsers}=require("./notifyUser")
const {
 
  ticketCreateMessage,
 
} = require("../../utils");
const {

  LaundryOperator,
} = require("../../utils/constants");
const { handleStatusNotification } = require("./handleStatusNotification");
const { handleAssignedNotifications } = require("./handleAssignedNotifications");


const handleNotification = async (
  req,
  updates,
  managersCollection,
  users,
  ticket
) => {
  const { assignedTo, status } = updates;
  //   console.log("udpates====",updates,"",status)
  if (assignedTo && status) {
    handleStatusNotification(req, updates, managersCollection, ticket);
    handleAssignedNotifications(
      req,
      updates,
      managersCollection,
      users,
      ticket
    );
    return;
  } else if (assignedTo) {
    handleAssignedNotifications(
      req,
      updates,
      managersCollection,
      users,
      ticket
    );
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
  roleBasedUserCollection,
  ticket
) => {
  const { role, name } = req.user;
  if (role === "USER") {
    // console.log("mamagers",managersCollection,"tech-",technicians)
    if (roleBasedUserCollection.length) {
      await notifyUsers(req, name, ticket, roleBasedUserCollection, ticketCreateMessage);
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
  if (role === "MANAGER" && roleBasedUserCollection.length) {
    console.log("collection of ", roleBasedUserCollection, "name", name);
    await notifyUsers(
      req,
      name,
      ticket,
      roleBasedUserCollection,
      ticketCreateMessage
    );
  }

  if (role === LaundryOperator) {
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
module.exports = { handleNotification, handleTicketNotification };
