const mongoose = require("mongoose");
const Ticket = require("../../models/groupTicketModel");
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
  laundaryCategory,
  PROGRESS,
  OPEN,
  COMPLETED,
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
const getLastTicketNumber = async (location) => {
  const lastTicket = await Ticket.findOne({location}).sort({ ticketNo: -1 });
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
    const { id: userId,roles:userRoles,locations,selectedLocation } = req.user;
    let roles=Object.keys(req.body).length?req.body : userRoles
    let tickets;
    if (roles.includes(MANAGER)) {
      // add lcoation as well
      tickets = Ticket.find({ location: { $in: selectedLocation  },});
    } 
   
    else if (roles.includes(USER)) {
      tickets = Ticket.find({ userId ,location: { $in:  selectedLocation },});
    }else if(roles.includes(TECHNICIAN)){
      tickets = Ticket.find({ 
        location: { $in:  selectedLocation },
        $or: [
          { assignedTo: userId },
          { assignedTo: NotAssignedId }
        ]
      });
    } else if(roles.includes(USER) && roles.includes(TECHNICIAN) ){
      return tickets = Ticket.find({ 
         location: { $in:  selectedLocation },
         $or: [
           { assignedTo: userId },
           { assignedTo: NotAssignedId },
           { userId }
         ]
       });
     }
    const populatedTickets = await populateTickets(tickets);
    const ticketStrcutureRes = await ticketStructure(populatedTickets);
    res.status(200).json(ticketStrcutureRes);
  } catch (err) {
    console.log("Err",err)
    res.status(500).json({ error: err.message });
  }
};
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;
    let tickets;
    let ticketStrcutureRes;
    if (category === laundaryCategory) {
      tickets = LaundaryTicket.findById(id);
      const populatedTickets = await populateLaundryTickets(tickets);
      if(!populateTickets){
          return   res.status(400).json("no ticket found");
      }
      ticketStrcutureRes = await laundryTicketStructure(populatedTickets);
    } else {
      tickets =Ticket.findById(id);
      const populatedTickets = await populateTickets(tickets);
      if(!populateTickets){
        return   res.
        status(400).json("no ticket found");
    }
      ticketStrcutureRes = await ticketStructure(populatedTickets);
    }
    res.status(200).json(ticketStrcutureRes);
  } catch (err) {
    console.log("err",err)
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
    const { id, companyId ,locations} = req.user;
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
    const { id, companyId,locations ,roles, selectedLocation} = req.user;
   
    const { SKU } = req.params;
    const getRoom = await Room.findOne({
      location: { $in: selectedLocation },
      $or: [
        { SKU: SKU }, 
        { roomName: SKU }, 
      ],
    }).lean();
  // console.log("get room",getRoom)
    let tickets ;
    if(!getRoom) return res.status(400).json({error:"did not found any room at this location"})
    if(roles.includes(MANAGER) || roles.includes(USER)){
     tickets= Ticket.find({
      location: { $in:  selectedLocation } ,
      room: getRoom._id,
        
      });
    }else{
      tickets=await Ticket.find({
        location: { $in:  selectedLocation } ,
        room: getRoom._id,
        $or: [
          { userId: id },
          { assignedTo: id }
        ]
        
      });
    }
    // console.log("tikse",tickets)
    const populatedTickets = await populateTickets(tickets);
     console.log("populatedTickets",populatedTickets)
    if(!populatedTickets.length){
      return res.status(200).json([]);
    }
    const ticketStrcutureRes = await ticketStructure(populatedTickets);
    res.status(200).json(ticketStrcutureRes);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
};
const updateAll = async (req, res) => {
  try {
    const location = "66df7372e2fe86332f1ad7c5";

    const result = await Ticket.updateMany(
      { $set: { location: location } } 
    );
  } catch (error) {
    console.error("Error updating temperature readings:", error);
  }
};
const searchTicket = async (req, res) => {
  try {
    const { query ,locations, selectedLocation} = req.body;
    if (!query || query.trim() === "") {
      return res.status(200).json([]);
    }

    const tickets = await Ticket.find({
      location: { $in: selectedLocation } ,
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
      status,
      assignedTo,
      images,
      location,
      rooms,
      units,
      issueItem,
      issueItemDescription,
      audit,
      isSheduled,
      dueDate,
    } = req.body;
    const ticketNo = await getLastTicketNumber(location);
    const ticket = new Ticket({
      userId,
      issue,
      isSheduled:isSheduled??false,
      description,
      status,
      assignedTo,
      companyId,
      images,
      ticketNo,
      rooms,
      units,
      location,
      issueItem,
      issueItemDescription,
      dueDate,
      audit,

    });

    await ticket.save();
    console.log("ticket______________",ticket)
    if (mongoose.Types.ObjectId.isValid(ticket.assignedTo)) {
      await ticket.populate("assignedTo", "name email");
    }
    // assignedto will be array
    const assignedToPayload =
      !ticket.assignedTo.length
        ? [{ name: NotAssigned, _id: NotAssignedId }]
        : ticket.assignedTo
    const technicians = await getAllUsersByRole(companyId, TECHNICIAN);
    const managers = await getAllUsersByRole(companyId, MANAGER);
    console.log("here___")
    await ticket.populate([
      {
        path: "rooms",
        populate: {
          path: "units",
          model: "Unit",
        },
      },
      {
        path: "location",
      },
      {
        path: "units",
      },
    ]);
    
    // handleTicketNotification(req, managers, technicians, ticket);
   

    const Rooms = ticket.rooms.map(val=>({
      
        roomName: val.room.roomName,
        _id: val.room._id,
        SKU: val.room.SKU,
      
    }))
    console.log("ticket",ticket,"rooms",Rooms)
    // const unit = { name: ticket.room.unit.name, _id: ticket.room.unit._id };
    res.status(201).json({
      ...ticket.toObject(),
      rooms:Rooms,
      // unit,
      name,
      email,
      assignedTo: assignedToPayload,
    });
  } catch (err) {
    console.log("err--------------------",err)
    res.status(500).json({ error: err.message });
  }
};

const updateTicket = async (req, res) => {
  try {
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const { roles, companyId, name: usedBy, id: userId } = req.user;
      const { ticketId } = req.params;
      const updates = req.body;
      const inventoryUsed = updates?.inventoryUsed;
      const isInventoryUsed = Array.isArray(inventoryUsed);

      if (!mongoose.Types.ObjectId.isValid(ticketId)) {
        throw new Error("Invalid ticketId");
      }

      if (inventoryUsed && isInventoryUsed) {
        for (const item of inventoryUsed) {
          const getInventoryItem = await InventoryModel.findById(
            item.inventoryId
          );
          const filteredInventoryUsedTicket = getInventoryItem.inventoryUsed?.filter(
            (usedItem) => usedItem.ticket.toString() === ticketId
          );
         
            let getStatus = {};
              const filteredInventoryUsed = getInventoryItem.inventoryUsed?.filter(
                (usedItem) => usedItem.ticket.toString() !== ticketId
              );
            // filtering this ticket data and totaling others ,so will get inventoryused for them 
               const totalUsedItemQty = filteredInventoryUsed?.reduce(
                (total, usedItem) => total + usedItem.usedItemQty,
                0
              );
              const usedItem = { usedItem: totalUsedItemQty ,updatedQty:item.quantityUsed};
              getStatus = updateStockStatus({
                ...getInventoryItem.toObject(),
                ...usedItem,
              });
            if (
              getStatus.status === "Out of Stock" &&
              getStatus.availableQty < 0
            ) {
              return res
                .status(400)
                .send("Inventory is out of stock ,can't order that much");
            }
            const getTicket=await Ticket.findById(ticketId).populate("room").select("room ticketNo");
            if(filteredInventoryUsedTicket.length){
            const result = await InventoryModel.updateOne(
              { _id: item.inventoryId, "inventoryUsed.ticket": ticketId }, // Look for a document with a matching ticketId in inventoryUsed array
              {
                $set: {
                  "inventoryUsed.$.room": getTicket.room,
                  "inventoryUsed.$.ticketNo": getTicket.ticketNo,
                  "inventoryUsed.$.usedBy": usedBy,
                  "inventoryUsed.$.updatedDate": new Date(),
                  "inventoryUsed.$.roles": roles,
                  "inventoryUsed.$.usedItemQty": item.quantityUsed,
                  usedItem: item.quantityUsed,
                  status: getStatus.status,
                },
              })

          
            if (result.modifiedCount === 0) {
              return res.status(400).send("Inventory item is not updated");
            }
         
          }else{
              const res = await InventoryModel.updateOne(
                { _id: item.inventoryId },
                {
                  $push: {
                    inventoryUsed: {
                      room: getTicket.room,
                      ticket: ticketId,
                      ticketNo: getTicket.ticketNo,
                      usedBy: usedBy,
                      updatedDate: new Date(),
                      roles: roles,
                      usedItemQty: item.quantityUsed,
                      status: getStatus.status,
                    },
                  },
                  $set: {
                    usedItem: item.quantityUsed,
                  },
                }
              );
            }
           
       
            const updatedInventory = await InventoryModel.findById(
              item.inventoryId
            );
            const totalUsedItemQtyFinal = updatedInventory.inventoryUsed.reduce(
              (total, usedItem) => total + usedItem.usedItemQty,
              0
            );
            await InventoryModel.updateOne(
              { _id: item.inventoryId },
              { $set: { usedItem: totalUsedItemQtyFinal } }
            );
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
        }) .populate({
          path: "comments.userId",         // Populating the userId inside each comment
          select: "name email"             // Selecting the name and email of the user who commented
        }).populate({path:"location",select:"locationName settings"});
      // const populatedTickets=populateTickets(ticket)
      const ticketStrcutureRes = await ticketStructure(populatedTickets);
      const users = await getAllUsersByRole(companyId, USER);
      const managers = await getAllUsersByRole(companyId, MANAGER);
      handleNotification(req, updates, managers, users, populatedTickets);

      res.status(200).json(ticketStrcutureRes);
    });
  } catch (err) {
    console.log("err-----",err)
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

// Controller to update tickets' status from "Progress" to "In-Progress"
const updateInBulk = async (req, res) => {
  const session = await mongoose.startSession(); // Start a new session if using transactions
  session.startTransaction();

  try {
    // Update tickets that currently have status "Progress" to "In-Progress"
    const result = await Ticket.updateMany(
      { status: "COMPLETED" }, // Filter: Only update tickets with 'Progress' status
      { status: COMPLETED }, // Update: Set status to 'In-Progress'
      { session }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'No tickets with "Progress" status were updated' });
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ 
      message: `${result.modifiedCount} tickets updated from "Progress" to "In-Progress"`, 
      result 
    });
  } catch (error) {
    await session.abortTransaction(); // Rollback the transaction if there is an error
    session.endSession();
    console.error('Error updating tickets:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  updateInBulk,
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
