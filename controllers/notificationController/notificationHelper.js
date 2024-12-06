const {notifyUsers}=require("./notifyUser")
const {
 
  ticketCreateMessage,
 
} = require("../../utils");
const {

  LaundryOperator,
  maintenanceCategory,
  USER,
  MANAGER,
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
  if (assignedTo && status) {
    handleStatusNotification(req, updates, managersCollection, ticket,maintenanceCategory);
    handleAssignedNotifications(
      req,
      updates,
      managersCollection,
      users,
      ticket,maintenanceCategory
    );
    return;
  } else if (assignedTo) {
    handleAssignedNotifications(
      req,
      updates,
      managersCollection,
      users,
      ticket,maintenanceCategory
    );
    return;
  } else if (status) {
    handleStatusNotification(req, updates, managersCollection, ticket,maintenanceCategory);
    return;
  }
};

const handleTicketNotification = async (
  req,
  managersCollection,
  roleBasedUserCollection,
  ticket
) => {
  const { roles, name } = req.user;
  if (roles.includes(USER)) {
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
    await notifyUsers(
      req,
      name,
      ticket,
      roleBasedUserCollection,
      ticketCreateMessage,maintenanceCategory
    );
  }

};
module.exports = { handleNotification, handleTicketNotification };
