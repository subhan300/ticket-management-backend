const {
  updateTicketStatusMessage,
 
} = require("../../utils");
const { LaundryOperator, laundaryCategory, MANAGER } = require("../../utils/constants");

const {
  notifyAssignedUserAboutStatus,
} = require("./notifyAssignedUsersAboutStatus");
const { notifyManagersAboutStatus } = require("./notifyManagersAboutStatus");
const { notifyUsers } = require("./notifyUser");
const { notifyUsers2 } = require("./notifyUsers2");
const { sendSocketNotification } = require("./sendSocketNotification");

const handleLaundaryStatusNotification = async (
  req,
  updates,
  managersCollection,
  roleBasedUserCollection,
  ticket
) => {
  const { status } = updates;
  
  const { roles, name ,id} = req.user;
   const filterUser=roleBasedUserCollection.filter(val=>val._id !== id)
  if (roles.includes(LaundryOperator) && status) {
      await notifyUsers2(
        req,
        name,
        ticket,
        filterUser,
        updateTicketStatusMessage(name,status,ticket.ticketNo),laundaryCategory
        
      );
    
    if (managersCollection.length)
      await notifyUsers2(
        req,
        name,
        ticket,
        managersCollection,
        updateTicketStatusMessage(name,status,ticket.ticketNo),laundaryCategory
      );
  }

  if (roles.includes(MANAGER)) {
    await notifyUsers2(
        req,
        name,
        ticket,
        roleBasedUserCollection,
        updateTicketStatusMessage(name,status,ticket.ticketNo),laundaryCategory
      );
  }

 
};

module.exports = { handleLaundaryStatusNotification };
