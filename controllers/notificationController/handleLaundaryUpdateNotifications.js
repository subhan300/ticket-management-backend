const { LaundryOperator, laundaryCategory } = require("../../utils/constants");
const { ticketCreateMessage } = require("../../utils/notificationMessages");
const { notifyUsers } = require("./notifyUser");
const {handleStatusNotification} =require("./handleStatusNotification")
const {handleAssignedNotifications}=require("./handleAssignedNotifications");
const { handleLaundaryStatusNotification } = require("./laundaryStatusNotifications");
const { laundaryBatchNotification } = require("./laundaryBatchNotification");

const handleLaundaryUpdateTicketNotification = async (
    req,
    updates,
    managersCollection,
    roleBasedUserCollection,
    ticket,
  ) => {
     const category=laundaryCategory
    const { assignedTo, status,batchStatus } = updates;
      console.log("udpates====",assignedTo,"----",status,batchStatus)
    if (assignedTo && status) {
        console.log("shoul not reach")
    handleLaundaryStatusNotification(req, updates, managersCollection,roleBasedUserCollection,ticket);
      handleAssignedNotifications(
        req,
        updates,
        managersCollection,
        roleBasedUserCollection,
        ticket,category
      );
      return;
    } else if (assignedTo) {
        console.log("assinged to manger====")
      handleAssignedNotifications(
        req,
        updates,
        managersCollection,
        roleBasedUserCollection,
        ticket,category
      );
      return;
    } else if (status && !batchStatus) {
      // console.log("status==");
      handleLaundaryStatusNotification(req, updates, managersCollection,roleBasedUserCollection, ticket);
      return;
    }else if(status && batchStatus){
      laundaryBatchNotification(req,updates,managersCollection,roleBasedUserCollection,{})
    }
  };
  
module.exports = {  handleLaundaryUpdateTicketNotification };
