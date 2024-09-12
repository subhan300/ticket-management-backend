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
    const { id: userId, role } = req.user;
    let tickets;
    if (role === MANAGER) {
      tickets = LaundryTicket.find({}).lean();
    } else {
      tickets = LaundryTicket.find({ userId }).lean();
    }
    const populatedTickets = await populateLaundryTickets(tickets);
    const populatedTicketsStucture = await laundryTicketStructure(
      populatedTickets
    );

    res.status(200).json(populatedTicketsStucture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getFilterLocationTickets = async (req, res) => {
  try {
    const { id, companyId } = req.user;
    const {locationId}=req.params;
    console.log(locationId)
    const tickets = LaundryTicket.find({
      location: locationId,
      // $or: [{ assignedTo: id }, { assignedTo: NotAssignedId }],
    }).lean();
   if(tickets){
    const populatedTickets = await populateLaundryTickets(tickets);
    console.log(populatedTickets)
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

    const ticketNo = await getLastTicketNumber();
    const generateSku = generateSKU(
      `${req.body.room}-${ticketNo}`
    );
    const ticket = new LaundryTicket({
      userId,
      ticketNo,
      SKU: generateSku, // Initialize SKU as empty string
      companyId,
      archieve: false,
      comments: [],
      room:req.body.room,
      ...req.body,
    });
    await ticket.save();
    const getSelectedTicket =await LaundryTicket.findById(ticket._id).lean()
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
      })
      .sort({ createdAt: -1 });
      // const populatedTickets=await populateLaundryTickets(getSelectedTicket)
      // console.log("popuated==",populatedTickets)
     const strcutureLaundaryRes=await laundryTicketStructure(getSelectedTicket)
    const laundryOperator = await getAllUsersByRole(companyId, LaundryOperator);

    const managers = await getAllUsersByRole(companyId, MANAGER);

    handleTicketNotification(req, managers, laundryOperator, ticket);

    res.status(201)
      .json(strcutureLaundaryRes);
  } catch (err) {
     console.log("err",err)
    res.status(500).json({ error: err.message });
  }
};

const updateTicket = async (req, res) => {
  try {
    const { role, companyId } = req.user;
    const { ticketId } = req.params;
    const updates = req.body;
    const inventoryUsed = updates?.userItems;

    const managers = await getAllManagers(companyId);
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ error: "Invalid ticketId" });
    }

    const ticket = await LaundryTicket.findByIdAndUpdate(ticketId, updates, {
      new: true,
    })
      .populate("userId", "name email")
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
      .populate({ path: "location", model: "Location" }).lean()
      .sort({ createdAt: -1 });
    const populatedTicketsStucture = await laundryTicketStructure(ticket);
    const users = await getAllUsersByRole(companyId, USER);
    handleNotification(
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
     console.log("room",room,SKU)

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
  getResidentHistory,
  getResidentProductsAndLocationBySkuList,
  getResidentLocationByItemSku,
  createTicket,
  deleteTicket,
  getTicketByUserId,
  updateTicket,
  getAllTickets,
  addComment,
  getCompanyTickets,
  getResidentHistoryByRoomId,
  getFilterLocationTickets
};
