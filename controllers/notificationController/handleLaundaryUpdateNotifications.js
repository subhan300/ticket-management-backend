const { LaundryOperator } = require("../../utils/constants");
const { ticketCreateMessage } = require("../../utils/notificationMessages");
const { notifyUsers } = require("./notifyUser");
const {handleStatusNotification} =require("./handleStatusNotification")
const {handleAssignedNotifications}=require("./handleAssignedNotifications");
const { handleLaundaryStatusNotification } = require("./laundaryStatusNotifications");

const handleLaundaryUpdateTicketNotification = async (
    req,
    updates,
    managersCollection,
    roleBasedUserCollection,
    ticket
  ) => {
    const { assignedTo, status } = updates;
    //   console.log("udpates====",updates,"",status)
    if (assignedTo && status) {
    handleLaundaryStatusNotification(req, updates, managersCollection,roleBasedUserCollection,ticket);
      handleAssignedNotifications(
        req,
        updates,
        managersCollection,
        roleBasedUserCollection,
        ticket
      );
      return;
    } else if (assignedTo) {
      handleAssignedNotifications(
        req,
        updates,
        managersCollection,
        roleBasedUserCollection,
        ticket
      );
      return;
    } else if (status) {
      // console.log("status==");
      handleLaundaryStatusNotification(req, updates, managersCollection,roleBasedUserCollection, ticket);
      return;
    }
  };
  
module.exports = {  handleLaundaryUpdateTicketNotification };
