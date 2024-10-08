const { default: mongoose } = require("mongoose");
const LaundryTicket = require("../../models/laundryModel");
const { getAllManagers, getAllUsersByRole } = require("../globalController/GlobalController");
const { handleLaundaryUpdateTicketNotification } = require("../notificationController/handleLaundaryUpdateNotifications");
const { laundryTicketStructure, populateLaundryTickets } = require("../../utils");
const { LaundryOperator, LAUNDRY_STATUS, NotAssignedId, NotAssigned } = require("../../utils/constants");
const UserItem = require("../../models/userItemsModel");

const confirmCompleteStatus=[LAUNDRY_STATUS.WASH_COMPLETED, LAUNDRY_STATUS.DRYING_COMPLETED, LAUNDRY_STATUS.STREAM_PRESS,LAUNDRY_STATUS.LAUNDRY_COMPLETED]
const handleAssignedTo=(ticket)=>{
  const assignedTo =
  ticket.assignedTo === NotAssignedId
    ? { name: NotAssigned, _id: NotAssignedId }
    : ticket.assignedTo;
    return assignedTo
}
const getTicketsInProcess = async (req, res) => {
  try {
    const { id, companyId,locations } = req.user;
    const tickets =await LaundryTicket.find({
      location: locations[0],
      status: { $ne: LAUNDRY_STATUS.DELIVERED_TO_RESIDENT}, 
      confirmRecieve: { $exists: true, $not: { $size: 0 } }, 
    })
    .select("ticketNo room userItems confirmRecieve confirmCompleted status assignedTo").populate("room");
   
     
    if(!tickets.length){
      return res.status(200).json([]);
    }
    console.log("tickets[0]",tickets[0])
    if (mongoose.Types.ObjectId.isValid(tickets[0].assignedTo)) {
      await tickets[0].populate("assignedTo", "name email");
    }
     const assignedTo=handleAssignedTo(tickets[0])
   
      const populatedTicketsStructure=tickets.map(val=>({...val.toObject(),assignedTo}))
      return res.status(200).json(populatedTicketsStructure);


  } catch (err) {
    console.log("err",err)
    return res.status(500).json({ error: err.message });
  }
};
const confirmLaundaryItems = async (req, res) => {
  try {
    const { id } = req.user; // Extract user ID from req.user
    const { SKU} = req.body; // Get the laundary item to confirm
    console.log("sku",SKU)
   const  userItem=await UserItem.findOne({ SKU })
   console.log("laudnary item",userItem)
   if(!userItem){
      return res.status(404).json("No Item With this SKU exist");
   }
   const laundaryItem=userItem._id
    // Step 1: Find the ticket that contains the laundaryItem in userItems and status not LAUNDRY_COMPLETED
    const getTicket = await LaundryTicket.findOne({
      userItems: laundaryItem, 
      status: { $nin: [LAUNDRY_STATUS.DELIVERED_TO_RESIDENT] },
    }).select("status userItems confirmRecieve confirmCompleted");
     console.log("get tickets==",getTicket)
    if (!getTicket) {
      return res.status(404).json("No matching laundry ticket found.");
    }

    const { status, confirmRecieve, confirmCompleted, userItems } = getTicket;
    let updatePayload = {};
    // Helper function to compare two arrays of ObjectId as strings
    const areAllIdsPresent = (array1, array2) => {
      const set1 = new Set(array1.map(String));
      const set2 = new Set(array2.map(String));
      console.log("set 1",set1,"set2",set2)
      return [...set1].every(id => set2.has(id)) && [...set2].every(id => set1.has(id));
    };
     if(status===LAUNDRY_STATUS.PICKED_UP && confirmRecieve.includes(laundaryItem)){
        return res.status(400).send("Already Confirmed")     
      }
      if(confirmCompleteStatus.includes(status) && confirmCompleted.includes(laundaryItem)){
        return res.status(400).send("Already Confirmed")     
      }

    // Step 2: Determine if the laundaryItem should be pushed into confirmRecieve or confirmCompleted
    const tempConfirmRecieve = [...confirmRecieve, laundaryItem]; // Add item to confirmRecieve
    const tempConfirmComplete = [...confirmCompleted, laundaryItem]; // Add item to confirmCompleted
    console.log("temp recieve ====",tempConfirmRecieve)

    // Step 3: Update status based on if all userItems are present in confirmRecieve or confirmCompleted
    console.log("status",status)
    if (status === LAUNDRY_STATUS.PICKED_UP && areAllIdsPresent(userItems, tempConfirmRecieve)) {
      // If all userItems are in confirmRecieve, update status to RECEIVED_IN_FACILITY
      updatePayload.status = LAUNDRY_STATUS.RECEIVED_IN_FACILITY;
      updatePayload.confirmRecieve = tempConfirmRecieve; 
      // return
     
    } else if (confirmCompleteStatus.includes(status) && areAllIdsPresent(userItems, tempConfirmComplete)) {
      // If all userItems are in confirmCompleted, update status to LAUNDRY_COMPLETED
      updatePayload.status = LAUNDRY_STATUS.LAUNDRY_COMPLETED;
      updatePayload.confirmCompleted = tempConfirmComplete; 
      // return
    }
    else if(status === LAUNDRY_STATUS.PICKED_UP) {
      updatePayload.confirmRecieve = tempConfirmRecieve; 
      // return
    } else if (confirmCompleteStatus.includes(status)) {
      updatePayload.confirmCompleted = tempConfirmComplete; 
      // return
    }
    const containValue=Object.keys(updatePayload)
    console.log("contain value----",containValue)
  if(containValue.length){
    const updatedTicket = await LaundryTicket.findByIdAndUpdate(
      getTicket._id, 
      updatePayload, 
      { new: true }
    ).populate("room")

     .select("ticketNo userItems confirmRecieve confirmCompleted status assignedTo");
     const assignedTo=handleAssignedTo(updatedTicket);
     const populatedTicketsStructure={...updatedTicket.toObject(),assignedTo}
      return res.status(200).json(populatedTicketsStructure);

  }

  return res.status(400).json("No Condition Met To Confirm Laundary Now");
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const updateTicket = async (req, res) => {
    try {
      const { role, companyId ,name,id} = req.user;
      const { ticketId } = req.params;
      const updates = req.body;
      const {userItems,confirmRecieve}=req.body
      const inventoryUsed = updates?.userItems;
      const getTicket=await LaundryTicket.findById(updates._id)
      console.log("confirmRecieve",getTicket?.confirmRecieve?.length,"updates",userItems)
    if(userItems && getTicket.confirmRecieve.length){
      const existingTicket = await LaundryTicket.findOne({
        userItems: { $in: userItems }, // Check if any of the userItems are in existing tickets
        status: { $nin: [LAUNDRY_STATUS.DELIVERED_TO_RESIDENT] },
      });
       
      if (existingTicket) {
        const {userItems}=await existingTicket.populate("userItems")
        const itemNames = userItems.map(val => val.itemName).join(', ');
        return res.status(400).json({
          message: `These items ${itemNames} are already in an active laundry process and cannot be added to a new ticket.`
        });
      }
    }
      const managers = await getAllManagers(companyId);
      if (!mongoose.Types.ObjectId.isValid(ticketId)) {
        return res.status(400).json({ error: "Invalid ticketId" });
      }
  
      const ticket = await LaundryTicket.findByIdAndUpdate(ticketId, {...updates,updatedBy:id}, {
        new: true,
      })
        .populate("userId", "name email").populate("updatedBy","name email")
        .populate({
          path: "userItems",
          model: "UserItem",
          // select: "",
        })
        .populate({
          path: "room",
          populate: {
            path: "unit",
            model: "Unit",
          },
        })
        .populate({ path: "location", model: "Location" })
        .sort({ createdAt: -1 });
      const populatedTicketsStucture = await laundryTicketStructure(ticket);
      const users = await getAllUsersByRole(companyId, LaundryOperator);
      handleLaundaryUpdateTicketNotification(
        req,
        updates,
        managers,
        users,
        populatedTicketsStucture
      );
       console.log("populatedTicketsStucture",populatedTicketsStucture)
      res.status(200).json(populatedTicketsStucture);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };


const updateInProcessTicketStatus = async (req, res) => {
  try {
    const { role, companyId, name, id } = req.user;
    const { ticketIds,  } = req.body; // Assuming ticketIds is an array and status is the new status to set
    const itemPayload=req.body
    console.log("ticket===",ticketIds)
    // Validate ticketIds array
    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({ error: "Invalid or missing ticketIds" });
    }

    // Ensure all ticketIds are valid MongoDB ObjectIDs
    const areValidIds = ticketIds.every((ticketId) =>
      mongoose.Types.ObjectId.isValid(ticketId)
    );
    if (!areValidIds) {
      return res.status(400).json({ error: "One or more invalid ticketIds" });
    }

    // Update status of all tickets in the collection
    const updatedTickets = await LaundryTicket.updateMany(
      { _id: { $in: ticketIds } }, // Filter for all tickets with the provided IDs
      { ...itemPayload, updatedBy: id } // Update status and who made the update
    );

    if (updatedTickets.nModified === 0) {
      return res.status(404).json({ message: "No tickets were updated" });
    }

    // Optionally, fetch the updated tickets to return in the response
    const tickets = await LaundryTicket.find({ _id: { $in: ticketIds } })
      .populate("userId", "name email")
      .populate("updatedBy", "name email")
      .populate({
        path: "userItems",
        model: "UserItem",
      })
      .populate({
        path: "room",
        populate: {
          path: "unit",
          model: "Unit",
        },
      })
      .populate({ path: "location", model: "Location" })
      .sort({ createdAt: -1 });

    const populatedTicketsStructure =await laundryTicketStructure(tickets)
    console.log("tickets",tickets,"populated structure",populatedTicketsStructure)

    // const managers = await getAllManagers(companyId);
    // const users = await getAllUsersByRole(companyId, LaundryOperator);
    // handleLaundaryUpdateTicketNotification(
    //   req,
    //   { status }, // Sending the updated status for notification
    //   managers,
    //   users,
    //   populatedTicketsStructure
    // );

    res.status(200).json(populatedTicketsStructure);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



  
  module.exports={
    updateInProcessTicketStatus,
    confirmLaundaryItems,
    getTicketsInProcess,
    updateTicket
  }