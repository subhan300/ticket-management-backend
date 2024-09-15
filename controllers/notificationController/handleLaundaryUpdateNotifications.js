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
      console.log("udpates====",assignedTo,"----",status)
    if (assignedTo && status) {
        console.log("shoul not reach")
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
        console.log("assinged to manger====")
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
