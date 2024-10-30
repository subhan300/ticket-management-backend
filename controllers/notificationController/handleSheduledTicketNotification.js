const { ticketCreateMessage } = require("../../utils");
const { USER, MANAGER, maintenanceCategory } = require("../../utils/constants");
const connectedUsers = require("../../utils/store-data/connectedUsers");
const { createNotification } = require("./createNotification");
const { sendSocketNotification } = require("./sendSocketNotification");

const notifyUsers = async (
  req,
  name,
  ticket,
  usersCollection,
  messageHandler,
  category
) => {
  const { roles } = req.user;
  const { ticketNo, _id: ticketId, assignedTo } = ticket;
  console.log("ticket====>", ticketNo, "ticket", ticket);
  for (const userId of usersCollection) {
    console.log("notify func run =====user====", userId);
    const socketId = connectedUsers[userId];
    const message = messageHandler(name,  roles,ticketNo,);
    const notifyRes = await createNotification(
      userId,
      message,
      ticketId,
      category
    );
    sendSocketNotification(req, socketId, notifyRes);
  }
};

const handleSheduledTicketNotification =async (
    req,
    managersCollection,
    roleBasedUserCollection,
    ticket
  ) => {
    const { roles, name } = req.user;
    if (roles.includes(USER)) {
      // console.log("mamagers",managersCollection,"tech-",technicians)
      if (roleBasedUserCollection.length) {
        await notifyUsers(req, name, ticket, roleBasedUserCollection, ticketCreateMessage,maintenanceCategory);
      }
      if (managersCollection.length)
        await notifyUsers(
          req,
          name,
          ticket,
          managersCollection,
          ticketCreateMessage,maintenanceCategory
        );
    }
    if (roles.includes(MANAGER) && roleBasedUserCollection.length) {
      console.log("collection of ", roleBasedUserCollection, "name", name);
      await notifyUsers(
        req,
        name,
        ticket,
        roleBasedUserCollection,
        ticketCreateMessage,maintenanceCategory
      );
    }
  
  };
module.exports = { handleSheduledTicketNotification };
