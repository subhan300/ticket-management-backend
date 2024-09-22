const mongoose = require("mongoose");
const Ticket = require("../../models/ticketModel");
const LaundaryTicket = require("../../models/laundryModel");
const User = require("../../models/userModel");
const Room = require("../../models/roomModel");
const {
  ObjectId,
  formatTicketNumber,
  updateStockStatus,
  populateTickets,
  ticketStructure,
  populateLaundryTickets,
  laundryTicketStructure,
} = require("../../utils");
const {
  TECHNICIAN,
  NotAssigned,
  NotAssignedId,
  MANAGER,
  USER,
} = require("../../utils/constants");
const InventoryModel = require("../../models/inventoryModel");
const connectedUsers = require("../../utils/store-data/connectedUsers");
const Notification = require("../../models/notificationModel");
const {
  getAllManagers,
  getAllUsersByRole,
} = require("../globalController/GlobalController");
const {
  handleNotification,
  handleTicketNotification,
} = require("../notificationController/notificationHelper");
const userModel = require("../../models/userModel");
const getLastTicketNumber = async () => {
  const lastTicket = await Ticket.findOne().sort({ ticketNo: -1 });
  const getNumber = lastTicket ? lastTicket.ticketNo : 0;
  return formatTicketNumber(getNumber);
};

const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
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
      // add lcoation as well
      tickets = Ticket.find({});
    } else {
      tickets = Ticket.find({ userId });
    }
    const populatedTickets = await populateTickets(tickets);
    const ticketStrcutureRes = await ticketStructure(populatedTickets);
    res.status(200).json(ticketStrcutureRes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getTicketById = async (req, res) => {
  try {
    const { role } = req.user;
    const { id } = req.params;
    const { category } = req.body;
    let tickets;
    let ticketStrcutureRes;
    if (category === "laundary") {
      tickets = LaundaryTicket.findById(id);
      const populatedTickets = await populateLaundryTickets(tickets);
      ticketStrcutureRes = await laundryTicketStructure(populatedTickets);
    } else {
      tickets = Ticket.findById(id);
      const populatedTickets = await populateTickets(tickets);
      ticketStrcutureRes = await ticketStructure(populatedTickets);
    }
    console.log("tickets>>>>>>>>>", tickets);
    // const populatedTickets = await populateTickets(tickets);
    //  ticketStrcutureRes = await ticketStructure(populatedTickets);
    res.status(200).json(ticketStrcutureRes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getFilterCompanyTickets = async (req, res) => {
  try {
    const { id, companyId } = req.user;

    const tickets = Ticket.find({
      companyId: companyId,
      $or: [{ assignedTo: id }, { assignedTo: NotAssignedId }],
    });
    const populatedTickets = await populateTickets(tickets);
    const ticketStrcutureRes = await ticketStructure(populatedTickets);
    res.status(200).json(ticketStrcutureRes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getCompanyTickets = async (req, res) => {
  try {
    const { id, companyId } = req.user;

    const tickets = Ticket.find({
      companyId: companyId,
    });
    const populatedTickets = await populateTickets(tickets);
    const ticketStrcutureRes = await ticketStructure(populatedTickets);
    res.status(200).json(ticketStrcutureRes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getUserTicket = async (req, res) => {
  try {
    const { id, companyId,locations } = req.user;
    // console.log("location",locations)
    const { SKU } = req.params;
    const getRoom = await Room.findOne({
      // locations: { $in: locationArray },
      $or: [
        { SKU: SKU }, 
        { roomName: SKU }, 
      ],
    }).lean();
 
    const tickets = Ticket.find({
      companyId: companyId,
      room: getRoom._id,
    });
    const populatedTickets = await populateTickets(tickets);
    console.log(populatedTickets);
    const ticketStrcutureRes = await ticketStructure(populatedTickets);
    res.status(200).json(ticketStrcutureRes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const searchTicket = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.trim() === "") {
      return res.status(200).json([]);
    }

    const tickets = await Ticket.find({
      $or: [
        { issue: { $regex: query, $options: "i" } },
        { issueItem: { $regex: query, $options: "i" } },
        { issueItemDescription: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .populate({
        path: "room",
        populate: {
          path: "unit",
          model: "Unit",
        },
      })
      .select("ticketNo room issue description")
      .sort({ createdAt: -1 })
      .lean();

    if (!tickets.length) {
      return res.status(200).json([]);
    }
    const ticketsRes = tickets.map((ticket) => {
      const Room = { roomName: ticket?.room?.roomName, _id: ticket?.room?._id };
      const unit = {
        name: ticket?.room?.unit?.name,
        _id: ticket?.room?.unit?._id,
      };
      return { ...ticket, room: Room, unit };
    });

    res.status(200).json(ticketsRes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const createTicket = async (req, res) => {
  try {
    const { companyId, name, email, id: userId } = req.user;
    const {
      issue,
      description,
      issueLocation,
      status,
      assignedTo,
      images,
      location,
      room,
      issueItem,
      issueItemDescription,
      audit,
      dueDate,
    } = req.body;
    const ticketNo = await getLastTicketNumber();
    const ticket = new Ticket({
      userId,
      issue,
      description,
      issueLocation,
      status,
      assignedTo,
      companyId,
      images,
      ticketNo,
      room,
      location,
      issueItem,
      issueItemDescription,
      dueDate,
      audit,
    });

    await ticket.save();
    if (mongoose.Types.ObjectId.isValid(ticket.assignedTo)) {
      await ticket.populate("assignedTo", "name email");
    }
    const assignedToPayload =
      ticket.assignedTo === NotAssignedId
        ? { name: NotAssigned, _id: NotAssignedId }
        : ticket.assignedTo;
    const technicians = await getAllUsersByRole(companyId, TECHNICIAN);
    const managers = await getAllUsersByRole(companyId, MANAGER);
    handleTicketNotification(req, managers, technicians, ticket);
    await ticket.populate({
      path: "room",
      populate: {
        path: "unit",
        model: "Unit",
      },
    });

    const Room = {
      roomName: ticket.room.roomName,
      _id: ticket.room._id,
      SKU: ticket.room.SKU,
    };
    const unit = { name: ticket.room.unit.name, _id: ticket.room.unit._id };
    res.status(201).json({
      ...ticket.toObject(),
      room: Room,
      unit,
      name,
      email,
      assignedTo: assignedToPayload,
    });
  } catch (err) {
    consol.log("err",err)
    res.status(500).json({ error: err.message });
  }
};

const updateTicket = async (req, res) => {
  try {
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const { role, companyId, name: usedBy, id: userId } = req.user;
      const { ticketId } = req.params;
      const updates = req.body;
      const inventoryUsed = updates?.inventoryUsed;
      const isInventoryUsed = Array.isArray(inventoryUsed);

      if (!mongoose.Types.ObjectId.isValid(ticketId)) {
        throw new Error("Invalid ticketId");
      }

      if (inventoryUsed && isInventoryUsed) {
        for (const item of inventoryUsed) {
          const getAvailableQty = await InventoryModel.findById(
            item.inventoryId
          ).lean();

          if (
            getAvailableQty &&
            getAvailableQty.availableQty < item.quantityUsed
          ) {
            throw new Error(
              `Inventory quantity is out of stock for item: ${getAvailableQty.productName}`
            );
          } else {
            let getStatus = {};

            if (item.quantityUsed) {
              const filteredInventoryUsed = getAvailableQty.inventoryUsed?.filter(
                (usedItem) => usedItem._id.toString() !== ticketId
              );

              const totalUsedItemQty = filteredInventoryUsed?.reduce(
                (total, usedItem) => total + usedItem.usedItemQty,
                0
              );
              const usedItem = { usedItem: totalUsedItemQty };
              getStatus = updateStockStatus({
                ...getAvailableQty,
                ...usedItem,
              });
            }
            if (
              getStatus.status === "Out of Stock" &&
              getStatus.availableQty < 0
            ) {
              return res
                .status(400)
                .send("Inventory is out of stock ,can't order that much");
            }
            const result = await InventoryModel.updateOne(
              { _id: item.inventoryId, "inventoryUsed.ticket": ticketId }, // Look for a document with a matching ticketId in inventoryUsed array
              {
                $set: {
                  "inventoryUsed.$.room": updates.room,
                  "inventoryUsed.$.ticketNo": updates.ticketNo,
                  "inventoryUsed.$.usedBy": usedBy,
                  "inventoryUsed.$.updatedDate": new Date(),
                  "inventoryUsed.$.role": role,
                  "inventoryUsed.$.usedItemQty": item.quantityUsed,
                  usedItem: item.quantityUsed,
                  status: getStatus.status,
                },
              }
            );
            if (result.modifiedCount === 0) {
              // If no document was updated, push a new entry to the array
              const res = await InventoryModel.updateOne(
                { _id: item.inventoryId },
                {
                  $push: {
                    inventoryUsed: {
                      room: updates.room,
                      ticket: ticketId,
                      ticketNo: updates.ticketNo,
                      usedBy: usedBy,
                      updatedDate: new Date(),
                      role: role,
                      usedItemQty: item.quantityUsed,
                      status: getStatus.status,
                    },
                  },
                  $set: {
                    usedItem: item.quantityUsed,
                  },
                }
              );
              console.log("inventory res====", res);
            }
            const updatedInventory = await InventoryModel.findById(
              item.inventoryId
            );
            const totalUsedItemQty = updatedInventory.inventoryUsed.reduce(
              (total, usedItem) => total + usedItem.usedItemQty,
              0
            );
            await InventoryModel.updateOne(
              { _id: item.inventoryId },
              { $set: { usedItem: totalUsedItemQty } }
            );
          }
        }
      }

      if (req.files) {
        if (req.files.images) {
          updates.images = req.files.images.map((file) => file.path);
        }
        if (req.files.files) {
          updates.files = req.files.files.map((file) => file.path);
        }
      }

      const populatedTickets = await Ticket.findByIdAndUpdate(
        ticketId,
        {...updates,updatedBy:userId},
        {
          new: true,
          session,
        }
      )
        .populate("userId", "name email")
        .populate({
          path: "inventoryUsed.inventoryId",
          model: "Inventory",
          select: "productName productImage",
        }).populate("updatedBy","name email")
        .populate({
          path: "room",
          populate: {
            path: "unit",
            model: "Unit",
          },
        });
      // const populatedTickets=populateTickets(ticket)
      const ticketStrcutureRes = await ticketStructure(populatedTickets);
      const users = await getAllUsersByRole(companyId, USER);
      const managers = await getAllUsersByRole(companyId, MANAGER);
      handleNotification(req, updates, managers, users, populatedTickets);

      res.status(200).json(ticketStrcutureRes);
    });
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

    await Ticket.findByIdAndDelete(ticketId);
    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addComment = async (req, res) => {
  const { ticketId } = req.query;
  const { userId, text, images, files } = req.body;

  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
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

module.exports = {
  createTicket,
  deleteTicket,
  getTicketByUserId,
  getFilterCompanyTickets,
  updateTicket,
  getAllTickets,
  addComment,
  getCompanyTickets,
  getUserTicket,
  searchTicket,
  getTicketById,
};
