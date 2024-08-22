const mongoose = require("mongoose");
const LaundryTicket = require("../../models/laundryModel");
const { formatTicketNumber, populateLaundryTickets, generateSKU, laundryTicketStructure } = require("../../utils");
const {
  LaundryOperator,
  NotAssigned,
  NotAssignedId,
  MANAGER,
  USER,
} = require("../../utils/constants");
const InventoryModel = require("../../models/inventoryModel");
const connectedUsers = require("../../utils/store-data/connectedUsers");
const { getAllManagers, getAllUsersByRole } = require("../globalController/GlobalController");
const { handleNotification, handleTicketNotification } = require("../notificationController/notificationHelper");
const userModel = require("../../models/userModel");
const User = require("../../models/userModel");
const UserItem = require("../../models/userItemsModel");
const getLastTicketNumber = async () => {
  const lastTicket = await LaundryTicket.findOne().sort({ ticketNo: -1 });
  const getNumber= lastTicket ? lastTicket.ticketNo : 0;
  return formatTicketNumber(getNumber)
}


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
    const { id:userId } = req.user;
    const tickets = LaundryTicket.find({ userId })
    console.log("tickets==",tickets,"id==",userId)
    const populatedTickets = await populateLaundryTickets(tickets);
    const populatedTicketsStucture =await laundryTicketStructure(populatedTickets)
    
    res.status(200).json(populatedTicketsStucture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getFilterCompanyTickets = async (req, res) => {
  try {
    const { id, companyId } = req.user;

    const tickets = await LaundryTicket.find({
      companyId: companyId,
      $or: [{ assignedTo: id }, { assignedTo: NotAssignedId }],
    })
    const populatedTickets = populateLaundryTickets(tickets);
    const populatedTicketsStucture =await laundryTicketStructure(populatedTickets)
  
    res.status(200).json(populatedTicketsStucture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getCompanyTickets = async (req, res) => {
  try {
    const { id, companyId } = req.user;

    const tickets = await LaundryTicket.find({
      companyId: companyId,
    })
   
    const populatedTickets =  populateLaundryTickets(tickets);
    const populatedTicketsStucture =await laundryTicketStructure(populatedTickets)
  
    res.status(200).json(populatedTicketsStucture);
    // res.status(200).json(restructureData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getUserTicket = async (req, res) => {
  try {
    const {  companyId } = req.user;
    const {SKU}=req.params;
    console.log("SKU--",SKU)
    const getResident=await userModel.findOne({SKU}).select("name locationName livingLocation email").lean();
   console.log("get resident ===== >",getResident);
   
    const tickets = await LaundryTicket.find({
      companyId: companyId,
      resident:getResident._id
    })
    const populatedTickets =  populateLaundryTickets(tickets);
    const populatedTicketsStucture =await laundryTicketStructure(populatedTickets)
    res.status(200).json(populatedTicketsStucture);
    // res.status(200).json(restructureData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createTicket = async (req, res) => {
    try {
      const { companyId, name, email, id: userId } = req.user;
     
       const {resident}=req.body
      const ticketNo = await getLastTicketNumber();
    const generateSku=generateSKU(`${req.body.resident}-${ticketNo}`)
      const ticket = new LaundryTicket({
        userId,
        ticketNo,
        SKU: generateSku, // Initialize SKU as empty string
        companyId,
        archieve: false,
        comments: [], 
        ...req.body
      })
      await ticket.save();
      const getSelectedTicket = await LaundryTicket.findById(ticket._id).populate("userId", "name email")
      .populate({
        path: "userItems",
        model: "UserItem",
        // select: "",
      }).populate("resident", "name email")
  
      console.log("get selcted",getSelectedTicket )
      const laundryOperator = await getAllUsersByRole(
        companyId,
        LaundryOperator
      );
    const user = await User.findById(resident).select('name email livingLocation');
      const managers = await getAllUsersByRole(companyId, MANAGER);
     
      handleTicketNotification(req, managers, laundryOperator, ticket);
  
      res.status(201).json({...getSelectedTicket.toObject(),name,email}
        
      
      );
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };


const updateTicket = async (req, res) => { 
  try {
    const {role,companyId} = req.user;
    // console.log("role===",role)
    const { ticketId } = req.params;
    const updates = req.body;
    const inventoryUsed=updates?.userItems
   
     console.log("connected users check here",connectedUsers)
    //  console.log("updates====",updates)
     const managers=await getAllManagers(companyId)
     console.log("managers",managers)
    
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ error: "Invalid ticketId" });
    }
    
    const ticket =await LaundryTicket.findByIdAndUpdate(ticketId, updates, {
      new: true,
    })
    .populate("userId", "name email")
    .populate({
      path: "userItems",
      model: "UserItem",
      // select: "",
    }).populate("resident", "name email")
    console.log("updated ===",ticket)
    // const populatedTickets = await populateLaundryTickets(ticket);
    const populatedTicketsStucture =await laundryTicketStructure([ticket])
  
     const users = await getAllUsersByRole(companyId,USER)
    
   handleNotification(req,updates,managers,users,populatedTicketsStucture[0])
   
    
    res.status(200).json(populatedTicketsStucture[0]);
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

const getResidentLocationByItemSku = async (req, res) => {
  try {
      const {SKU} = req.params;
        const item = await UserItem.findOne({ SKU}).populate('user',"name livingLocation locationName").lean();
        if (item && item.user) {
             const {itemName,itemImage,color,category,size,SKU,_id,user}=item
            const structureResponse={product:{itemName,itemImage,color,category,size,SKU,_id},user}
         
           return  res.status(200).send(structureResponse)
        } 
        return res.status(400).send("failed to get item and  location")
      }
    catch (error) {
        console.error(error);
       return  res.status(400).send("failed to get location")
    }}
    const getResidentLocationById = async (req, res) => {
      try {
          const {residentId} = req.params;
            const item = await userModel.findById(residentId).select("name livingLocation locationName")
            if (item) {
                console.log("item",item)
              return  res.status(200).send(item)
            }
            return  res.status(400).send("no item found")
          }
        catch (error) {
            console.error(error);
           return  res.status(400).send("failed to get location")
        }}


module.exports = {
  getResidentLocationById,
  getResidentLocationByItemSku,
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
