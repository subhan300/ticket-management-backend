const {
    updateTicketStatusMessage,
    updateBatchLaundryStatusMessage,
   
  } = require("../../utils");
  const { LaundryOperator, laundaryCategory } = require("../../utils/constants");
  
  const {
    notifyAssignedUserAboutStatus,
  } = require("./notifyAssignedUsersAboutStatus");
  const { notifyManagersAboutStatus } = require("./notifyManagersAboutStatus");
  const { notifyUsers } = require("./notifyUser");
  const { notifyUsers2 } = require("./notifyUsers2");
  const { sendSocketNotification } = require("./sendSocketNotification");
  
  const laundaryBatchNotification = async (
    req,
    updates,
    managersCollection,
    roleBasedUserCollection,
    ticket
  ) => {
    const { status,tickets } = updates;
    
    const { role, name ,id} = req.user;
    const ticketNoAll = tickets.map(val => val.ticketNo).join(",");
     const filterUser=roleBasedUserCollection.filter(val=>val._id !== id)
    if (role === LaundryOperator && status) {
        await notifyUsers2(
          req,
          name,
          ticket,
          filterUser,
          updateBatchLaundryStatusMessage(name,status,ticketNoAll),laundaryCategory
          
        );
      
      if (managersCollection.length)
        await notifyUsers2(
          req,
          name,
          ticket,
          managersCollection,
          updateBatchLaundryStatusMessage(name,status,ticketNoAll),laundaryCategory
        );
    }
  
    if (role === "MANAGER") {
      await notifyUsers2(
          req,
          name,
          ticket,
          roleBasedUserCollection,
          updateBatchLaundryStatusMessage(name,status,ticketNoAll),laundaryCategory
        );
    }
  
   
  };
  
  module.exports = { laundaryBatchNotification  };
  