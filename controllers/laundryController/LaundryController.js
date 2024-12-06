const mongoose = require("mongoose");
const LaundryTicket = require("../../models/laundryModel");
const {
  formatTicketNumber,
  populateLaundryTickets,
  generateSKU,
  laundryTicketStructure,
} = require("../../utils");
const {
  LaundryOperator,
  NotAssigned,
  NotAssignedId,
  MANAGER,
  USER,
  LAUNDRY_STATUS,
} = require("../../utils/constants");

const {
  getAllManagers,
  getAllUsersByRole,
} = require("../globalController/GlobalController");
const {
  handleNotification,
  handleTicketNotification,
} = require("../notificationController/notificationHelper");

const UserItem = require("../../models/userItemsModel");
const roomModel = require("../../models/roomModel");
const { handleLaundaryTicketNotification } = require("../notificationController/handleLaundaryNotification");
const { handleLaundaryUpdateTicketNotification } = require("../notificationController/handleLaundaryUpdateNotifications");
const getLastTicketNumber = async () => {
  const lastTicket = await LaundryTicket.findOne().sort({ ticketNo: -1 });
  const getNumber = lastTicket ? lastTicket.ticketNo : 0;
  return formatTicketNumber(getNumber);
};

const getAllTickets = async (req, res) => {
  try {
    const tickets = await LaundryTicket.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTicketByUserId = async (req, res) => {
  try {
    const { id: userId, roles,locations } = req.user;
    let tickets;
    if (roles.includes(MANAGER)) {
      tickets = LaundryTicket.find({ location: { $in: locations },});
    } else {
      // for now show all tickets
      tickets = LaundryTicket.find({ location: { $in: locations }, });
    }
    const populatedTickets = await populateLaundryTickets(tickets);
    if(!populatedTickets.length){
     return res.status(200).json({message:"No tickets found"});
    }
    const populatedTicketsStucture = await laundryTicketStructure(
      populatedTickets
    );
    return res.status(200).json(populatedTicketsStucture);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const updateAll = async (req, res) => {
  try {
    const location = "66df7372e2fe86332f1ad7c5";

    const result = await LaundryTicket.updateMany(
      { $set: { location: location } } 
    );
  } catch (error) {
    console.error("Error updating temperature readings:", error);
  }
};

const getLaundryTicketByRoom = async (req, res) => {
  try {
     const {locations}=req.user;
    
    const { room } = req.body
     const getRoom=await roomModel.findOne({ location: { $in: locations },roomName:room})
    if(!getRoom){
      return res.status(404).json({message:"Room not found"})
    }
    let tickets = LaundryTicket.find({room:getRoom._id});
    
    const populatedTickets = await populateLaundryTickets(tickets);
    if(!populatedTickets.length){
      return res.status(200).json({message:"No tickets found"});
    }
    const populatedTicketsStucture = await laundryTicketStructure(
      populatedTickets
    );
    return res.status(200).json(populatedTicketsStucture);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const getFilterLocationTickets = async (req, res) => {
  try {
    const {locationId}=req.params;
    const tickets = LaundryTicket.find({
      location: locationId,
      // $or: [{ assignedTo: id }, { assignedTo: NotAssignedId }],
    });
   if(tickets){
    const populatedTickets = await populateLaundryTickets(tickets);
    const populatedTicketsStucture = await laundryTicketStructure(
      populatedTickets
    );

    return res.status(200).json(populatedTicketsStucture);
   }
   return res.status(400).json("no ticket found");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getCompanyTickets = async (req, res) => {
  try {
    const { id, companyId } = req.user;

    const tickets = await LaundryTicket.find({
      companyId: companyId,
    });

    const populatedTickets = populateLaundryTickets(tickets);
    const populatedTicketsStucture = await laundryTicketStructure(
      populatedTickets
    );

    res.status(200).json(populatedTicketsStucture);
    // res.status(200).json(restructureData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const createTicket = async (req, res) => {
  try {
    const { companyId, name, email, id: userId } = req.user;
    const { userItems } = req.body; // Assuming `userItems` are passed in req.body

    // Step 1: Check if any of the userItems are already in a laundry ticket that is not completed or delivered to the resident
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

    // Step 3: Proceed with creating a new ticket if no conflicting ticket is found
    const ticketNo = await getLastTicketNumber();
    const generateSku = generateSKU(`${req.body.room}-${ticketNo}`);

    const ticket = new LaundryTicket({
      userId,
      ticketNo,
      SKU: generateSku, // Generate SKU for the ticket
      companyId,
      archieve: false,
      comments: [],
      room: req.body.room,
      ...req.body, // Spread remaining fields from req.body (such as userItems)
    });

    await ticket.save();

    const getSelectedTicket = await LaundryTicket.findById(ticket._id)
      .populate("userId", "name email")
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
      }) .populate({
        path: "comments.userId",         // Populating the userId inside each comment
        select: "name email"             // Selecting the name and email of the user who commented
      })
      .sort({ createdAt: -1 });

    const structuredLaundaryRes = await laundryTicketStructure(getSelectedTicket);
    const laundryOperator = await getAllUsersByRole(companyId, LaundryOperator);
    const managers = await getAllUsersByRole(companyId, MANAGER);
    handleLaundaryTicketNotification(req, managers, laundryOperator, structuredLaundaryRes);
   
    return res.status(201).json(structuredLaundaryRes);

  } catch (err) {
    console.log("Error:", err);
    return res.status(500).json({ error: "Failed To Create Laundary Ticket" });
  }
};


const deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ error: "Invalid ticketId" });
    }

    await LaundryTicket.findByIdAndDelete(ticketId);
    res.status(200).json({ message: "LaundryTicket deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addComment = async (req, res) => {
  const { ticketId } = req.query;
  const { userId, text, images, files } = req.body;

  try {
    const ticket = await LaundryTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "LaundryTicket not found" });
    }

    const newComment = {
      userId,
      text,
      images,
      files,
    };

    ticket.comments.push(newComment);
    await ticket.save();

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// resident , we mean room as we dont have residnet info
const getResidentLocationByItemSku = async (req, res) => {
  try {
    const { SKU } = req.params;
    const item = await UserItem.findOne({ SKU }).lean();

    if (item) {
      const { itemName, itemImage, color, category, size, SKU, _id } = item;
      const structureResponse = {
        product: { itemName, itemImage, color, category, size, SKU, _id },
      };

      return res.status(200).send(structureResponse);
    }
    return res.status(400).send("failed to get item and  location");
  } catch (error) {
    console.error(error);
    return res.status(400).send("failed to get location");
  }
};

const getResidentProductsAndLocationBySkuList = async (req, res) => {
  try {
    const payload = req.body;
    const item = await UserItem.find({ SKU: { $in: payload } })
      .select("itemName itemImage SKU room unit").populate("room")
      .lean();
      if(!item || !item.length){
        return res.status(400).send("failed to get item and  location");
      }
    
      return res.status(200).send(item);
    
   
  } catch (error) {
    console.error(error);
    return res.status(400).send("failed to get location");
  }
};

// const getResidentLocationById = async (req, res) => {
//   try {
//     const { residentId } = req.params;
//     const item = await userModel
//       .findById(residentId)
//       .select("name livingLocation locationName");
//     if (item) {
//       console.log("item", item);
//       return res.status(200).send(item);
//     }
//     return res.status(400).send("no item found");
//   } catch (error) {
//     console.error(error);
//     return res.status(400).send("failed to get location");
//   }
// };

//getting resident history from room
const getResidentHistory = async (req, res) => {
  try {
    const { SKU } = req.params;
     const room=await roomModel.findOne({SKU});

      if (!room) {
      return res
        .status(404)
        .json({ message: "room  not found with this sku " });
    }
      const ticket = await LaundryTicket.find({ room:room._id })
      .select("ticketNo updatedAt")
      .populate("userItems")
      .exec();
      if (!ticket) {
        return res
          .status(404)
          .json({ message: "Ticket not found with this resident id " });
      }
   

    // Send response with ticket details including updated date and userItems
    res.json(ticket);
  } catch (error) {
    console.error(error);
    console.log(error);
    return res.status(400).send(error);
  }
};
const getResidentHistoryByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
     const room=await roomModel.findById(roomId);

      if (!room) {
      return res
        .status(404)
        .json({ message: "room  not found with this sku " });
    }
      const ticket = await LaundryTicket.find({ room:room._id })
      .select("ticketNo updatedAt")
      .populate("userItems")
      .exec();
      if (!ticket) {
        return res
          .status(404)
          .json({ message: "Ticket not found with this resident id " });
      }
   

    // Send response with ticket details including updated date and userItems
    res.json(ticket);
  } catch (error) {
    console.error(error);
    console.log(error);
    return res.status(400).send(error);
  }
};

module.exports = {
  getLaundryTicketByRoom,
  getResidentHistory,
  getResidentProductsAndLocationBySkuList,
  getResidentLocationByItemSku,
  createTicket,
  deleteTicket,
  getTicketByUserId,
  getAllTickets,
  addComment,
  getCompanyTickets,
  getResidentHistoryByRoomId,
  getFilterLocationTickets
};
