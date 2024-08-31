const mongoose = require("mongoose");
const Ticket = require("../../models/ticketModel");
const User = require("../../models/userModel");
const { ObjectId, formatTicketNumber,    updateTicketStatusMessage,
  updateTicketAssignedMessage,
  technicianUpdateTicketAssignedMessage, } = require("../../utils");
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
const { getAllManagers, getAllUsersByRole } = require("../globalController/GlobalController");
const { handleNotification, handleTicketNotification } = require("../notificationController/notificationHelper");
const userModel = require("../../models/userModel");
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
    const { id:userId } = req.user;
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
    res.status(200).json(populatedTickets);
    // res.status(200).json(restructureData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getCompanyTickets = async (req, res) => {
  try {
    const { id, companyId } = req.user;

    const tickets = await Ticket.find({
      companyId: companyId,
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

  
    res.status(200).json(populatedTickets);
    // res.status(200).json(restructureData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getUserTicket = async (req, res) => {
  try {
    const { id, companyId } = req.user;
    const {SKU}=req.params;
  //   const getResident=await userModel.findOne({SKU}).select("name locationName livingLocation email").lean();
  //  console.log("get resident ===== >",getResident);
   
    const tickets = await Ticket.find({
      companyId: companyId,
      "issueLocation.room":SKU
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
          // resident:getResident

        };
      })
    );

  
    res.status(200).json(populatedTickets);
    // res.status(200).json(restructureData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createTicket = async (req, res) => {
  try {
    const { companyId, name, email ,id:userId} = req.user;
    const {
      
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
   if (mongoose.Types.ObjectId.isValid(ticket.assignedTo)) {
    await ticket.populate("assignedTo", "name email");
  }
    const assignedToPayload =ticket.assignedTo === NotAssignedId
      ? { name: NotAssigned, _id: NotAssignedId }
      : ticket.assignedTo;
     const technicians = await getAllUsersByRole(companyId,TECHNICIAN)
     const managers = await getAllUsersByRole(companyId,MANAGER)
      handleTicketNotification(req,managers, technicians, ticket)
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
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const { role, companyId } = req.user;
      const { ticketId } = req.params;
      const updates = req.body;
      const inventoryUsed = updates?.inventoryUsed;
      const isInventoryUsed = Array.isArray(inventoryUsed);

      if (!mongoose.Types.ObjectId.isValid(ticketId)) {
        throw new Error("Invalid ticketId");
      }

      if (inventoryUsed && isInventoryUsed) {
        for (const item of inventoryUsed) {
          const getAvailableQty = await InventoryModel.findById(item.inventoryId);
          if (getAvailableQty && getAvailableQty.availableQty < item.quantityUsed) {
            throw new Error(`Inventory quantity is out of stock for item: ${getAvailableQty.productName}`);
          } else {
            await InventoryModel.findByIdAndUpdate(item.inventoryId, { usedItem: getAvailableQty.usedItem + item.quantityUsed });
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
        session,
      })
        .populate("userId", "name email")
        .populate({
          path: "inventoryUsed.inventoryId",
          model: "Inventory",
          select: "productName productImages",
        });

        const transformedInventoryUsed = ticket?.inventoryUsed?.map((item) => ({
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
               const users = await getAllUsersByRole(companyId,USER)
               const managers = await getAllUsersByRole(companyId,MANAGER)
             handleNotification(req,updates,managers,users,ticket)
             
              // return ({...ticket.toObject(),name,email,userId:_id,assignedTo,assignedDetail:ticket.assignedTo});
              const populatedTickets = {
                ...ticket.toObject(),
                name,
                email,
                userId: _id,
                assignedTo,
                inventoryUsed: transformedInventoryUsed?.length ? transformedInventoryUsed: [],
                assignedToColumn: assignedTo._id,
              };
              res.status(200).json(populatedTickets);
    });
   
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// const updateTicket = async (req, res) => { 
//   try {
//     const {role,companyId} = req.user;
//     // console.log("role===",role)
//     const { ticketId } = req.params;
//     const updates = req.body;
//     const inventoryUsed=updates?.inventoryUsed
//     const isInventoryUsed=Array.isArray(inventoryUsed)
//      const managers=await getAllManagers(companyId)
//     if (!mongoose.Types.ObjectId.isValid(ticketId)) {
//       return res.status(400).json({ error: "Invalid ticketId" });
//     }
    
//     if (inventoryUsed && isInventoryUsed) {
//       for (const item of inventoryUsed) {
//         let getAvailableQty = await InventoryModel.findById(item.inventoryId);
//         if (getAvailableQty && getAvailableQty.availableQty < item.quantityUsed) {

//           return res.status(400).json({ message: `Inventory quantity is out of stock for item:   ${getAvailableQty.productName}`,  });
//          }else{
//           const updateInventoryQty=await InventoryModel.findByIdAndUpdate(item.inventoryId,{usedItem:item.quantityUsed})
//           console.log("uodat inventory",updateInventoryQty)
//          }}}

//     if (req.files) {
//       if (req.files.images) {
//         updates.images = req.files.images.map((file) => file.path);
//       }
//       if (req.files.files) {
//         updates.files = req.files.files.map((file) => file.path);
//       }
//     }
//     const ticket = await Ticket.findByIdAndUpdate(ticketId, updates, {
//       new: true,
//     })
//       .populate("userId", "name email")
//       .populate({
//         path: "inventoryUsed.inventoryId",
//         model: "Inventory",
//         select: "productName productImages",
//       });
    
     
//     const transformedInventoryUsed = ticket?.inventoryUsed?.map((item) => ({
//       _id: item.inventoryId._id,
//       productName: item.inventoryId.productName,
//       productImages: item.inventoryId.productImages
//       ,
//       quantityUsed: item.quantityUsed,
//     }));
//     const { name, email, _id } = ticket.userId;

//     if (mongoose.Types.ObjectId.isValid(ticket.assignedTo)) {
//       await ticket.populate("assignedTo", "name email");
//     }
//     const assignedTo =
//       ticket.assignedTo === NotAssignedId
//         ? { name: NotAssigned, _id: NotAssignedId }
//         : ticket.assignedTo;
//      const users = await getAllUsersByRole(companyId,USER)
    
//    handleNotification(req,updates,managers,users,ticket)
   
//     // return ({...ticket.toObject(),name,email,userId:_id,assignedTo,assignedDetail:ticket.assignedTo});
//     const populatedTickets = {
//       ...ticket.toObject(),
//       name,
//       email,
//       userId: _id,
//       assignedTo,
//       inventoryUsed: transformedInventoryUsed?.length ? transformedInventoryUsed: [],
//       assignedToColumn: assignedTo._id,
//     };
    
//     res.status(200).json(populatedTickets);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

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
  getUserTicket
};
