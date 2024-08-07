const mongoose = require("mongoose");
const Ticket = require("../../models/ticketModel");
const User = require("../../models/userModel");
const { ObjectId, formatTicketNumber } = require("../../utils");
const {
  TECHNICIAN,
  NotAssigned,
  NotAssignedId,
} = require("../../utils/constants");
const InventoryModel = require("../../models/inventoryModel");
const getLastTicketNumber = async () => {
  const lastTicket = await Ticket.findOne().sort({ ticketNo: -1 });
  const getNumber= lastTicket ? lastTicket.ticketNo : 0;
  return formatTicketNumber(getNumber)
}


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
    const { userId } = req.params;
    const tickets = await Ticket.find({ userId })
      .populate("userId", "name email")
      .populate({
        path: "inventoryUsed.inventoryId",
        model: "Inventory",
        select: "productName productImages",
      })
      .sort({ createdAt: -1 });
    // .populate("assignedTo","name email");
    const populatedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        const { name, email, _id } = ticket.userId;

        if (mongoose.Types.ObjectId.isValid(ticket.assignedTo)) {
          await ticket.populate("assignedTo", "name email");
        }
        // console.log("ticket populate===>", ticket.assignedTo);
        const assignedTo =
          ticket.assignedTo === "NotAssigned"
            ? { name: NotAssigned, _id: "NotAssigned" }
            : ticket.assignedTo;

        const transformedInventoryUsed = ticket.inventoryUsed.map((item) => ({
          _id: item.inventoryId._id,
          productName: item.inventoryId.productName,
          productImages: item.inventoryId.productImages,
          quantityUsed: item.quantityUsed,
        }));

        return {
          ...ticket.toObject(),
          name,
          email,
          userId: _id,
          assignedTo,
          inventoryUsed: transformedInventoryUsed,
        };
      })
    );

    res.status(200).json(populatedTickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getFilterCompanyTickets = async (req, res) => {
  try {
    const { id, companyId } = req.user;

    const tickets = await Ticket.find({
      companyId: companyId,
      $or: [{ assignedTo: id }, { assignedTo: NotAssignedId }],
    })
      .populate("userId", "name email")
      .populate({
        path: "inventoryUsed.inventoryId",
        model: "Inventory",
        select: "productName productImages",
      })
      .sort({ createdAt: -1 });

    // .populate("assignedTo","name email");
    const populatedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        const { name, email, _id } = ticket.userId;

        if (mongoose.Types.ObjectId.isValid(ticket.assignedTo)) {
          await ticket.populate("assignedTo", "name email");
        }
        const assignedTo =
          ticket.assignedTo === NotAssignedId
            ? { name: NotAssigned, _id: NotAssignedId }
            : ticket.assignedTo;
            console.log("inventorid uses",ticket.inventoryUsed)
        const transformedInventoryUsed = ticket.inventoryUsed.map((item) => ({
          _id: item.inventoryId._id,
          productName: item.inventoryId.productName,
          productImages: item.inventoryId.productImages,
          quantityUsed: item.quantityUsed,
        }));

        // return ({...ticket.toObject(),name,email,userId:_id,assignedTo,assignedDetail:ticket.assignedTo});
        return {
          ...ticket.toObject(),
          name,
          email,
          userId: _id,
          assignedTo,
          inventoryUsed: transformedInventoryUsed,
          assignedToColumn: assignedTo._id,
        };
      })
    );

    // return populatedTickets;
    //  const restructureData= tickets.map(ticket => {
    //     const { name, email, _id } = ticket.userId; // Destructuring

    //     return ({...ticket.toObject(),name,email,userId:_id,assignedTo:ticket.assignedTo._id})

    //   });
    res.status(200).json(populatedTickets);
    // res.status(200).json(restructureData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createTicket = async (req, res) => {
  try {
    const { companyId, name, email } = req.user;
    console.log("req user", req.user);
    const {
      userId,
      issue,
      description,
      issueLocation,
      status,
      assignedTo,
      images,
    } = req.body;
    // const payload=req.body
    const ticketNo=await getLastTicketNumber()
    // const ticket = new Ticket(payload);
    const ticket = new Ticket({
      userId,
      issue,
      description,
      issueLocation,
      status,
      assignedTo,
      companyId,
      images,
      ticketNo
    });

    await ticket.save();
   console.log("ticket",ticket)
   if (mongoose.Types.ObjectId.isValid(ticket.assignedTo)) {
    await ticket.populate("assignedTo", "name email");
  }
    const assignedToPayload =ticket.assignedTo === NotAssignedId
      ? { name: NotAssigned, _id: NotAssignedId }
      : ticket.assignedTo;
    res.status(201).json({
      ...ticket.toObject(),
      name,
      email,
     assignedTo:assignedToPayload
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const updates = req.body;
    const { inventoryUsed } = req.body;
    // console.log("inventory used",inventoryUsed);

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ error: "Invalid ticketId" });
    }

    if (inventoryUsed && Array.isArray(inventoryUsed)) {
      for (const item of inventoryUsed) {
        let getAvailableQty = await InventoryModel.findById(item.inventoryId);
        // console.log("getAvailableQty", getAvailableQty);
        // getAvailableQty = {...getAvailableQty?.toObject(), availableQty: 2 };

        if (
          getAvailableQty &&
          getAvailableQty.availableQty < item.quantityUsed
        ) {
          console.log(
            "getAvailableQty.productName",
            getAvailableQty,
            getAvailableQty.productName
          );
          return res.status(400).json({
            message: `Inventory quantity is out of stock for item:  
                ${getAvailableQty.productName}`,
          });
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
    const ticket = await Ticket.findByIdAndUpdate(ticketId, updates, {
      new: true,
    })
      .populate("userId", "name email")
      .populate("userId", "name email")
      .populate({
        path: "inventoryUsed.inventoryId",
        model: "Inventory",
        select: "productName productImages",
      });
      
    const transformedInventoryUsed = ticket.inventoryUsed.map((item) => ({
      _id: item.inventoryId._id,
      productName: item.inventoryId.productName,
      productImages: item.inventoryId.productImages
      ,
      quantityUsed: item.quantityUsed,
    }));
    const { name, email, _id } = ticket.userId;

    if (mongoose.Types.ObjectId.isValid(ticket.assignedTo)) {
      await ticket.populate("assignedTo", "name email");
    }
    const assignedTo =
      ticket.assignedTo === NotAssignedId
        ? { name: NotAssigned, _id: NotAssignedId }
        : ticket.assignedTo;

    // return ({...ticket.toObject(),name,email,userId:_id,assignedTo,assignedDetail:ticket.assignedTo});
    const populatedTickets = {
      ...ticket.toObject(),
      name,
      email,
      userId: _id,
      assignedTo,
      inventoryUsed: transformedInventoryUsed,
      assignedToColumn: assignedTo._id,
    };
    res.status(200).json(populatedTickets);
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
};
