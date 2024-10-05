const { default: mongoose } = require("mongoose");
const LaundryTicket = require("../../models/laundryModel");
const { getAllManagers, getAllUsersByRole } = require("../globalController/GlobalController");
const { handleLaundaryUpdateTicketNotification } = require("../notificationController/handleLaundaryUpdateNotifications");
const { laundryTicketStructure, populateLaundryTickets } = require("../../utils");
const { LaundryOperator, LAUNDRY_STATUS } = require("../../utils/constants");

const updateTicket = async (req, res) => {
    try {
      const { role, companyId ,name,id} = req.user;
      const { ticketId } = req.params;
      const updates = req.body;
      const inventoryUsed = updates?.userItems;
  
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
      res.status(200).json(populatedTicketsStucture);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  const  confirmLaundaryItems = async (req, res) => {
    try {
      const { role, companyId ,name,id} = req.user;
      const { ticketId } = req.params;
      const updates = req.body;
      const {confirmRecieve,confirmCompleted,_id}=req.body;
      const getTicket=  await LaundryTicket.findById(_id);
      if(confirmRecieve.length===getTicket.userItems.length){
              
      }
      const inventoryUsed = updates?.userItems;
  
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
      res.status(200).json(populatedTicketsStucture);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  const getTicketsInProcess = async (req, res) => {
    try {
      const { id, companyId,locations } = req.user;
       console.log("locations---",locations[0])
      // Query to find tickets by location, exclude 'laundryNotCompleted' status and check 'confirmRecieve' array
      const tickets = LaundryTicket.find({
        location: locations[0],
        status: { $ne: LAUNDRY_STATUS.RECEIVED_IN_FACILITY}, // Exclude 'laundryNotCompleted'
        confirmRecieve: { $exists: true, $not: { $size: 0 } }, // Only include where confirmRecieve is not empty
      });
      console.log("ticket",tickets)
      // if (tickets.length > 0) {
        const populatedTickets = await populateLaundryTickets(tickets);
        const populatedTicketsStructure = await laundryTicketStructure(populatedTickets);
  
        return res.status(200).json(populatedTicketsStructure);
      // }
  
      return res.status(400).json("No tickets found");
    } catch (err) {
      console.log("err",err)
      return res.status(500).json({ error: err.message });
    }
  };
  
  module.exports={
    getTicketsInProcess,
    updateTicket
  }