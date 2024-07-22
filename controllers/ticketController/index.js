const mongoose = require('mongoose');
const Ticket = require('../../models/ticketModel');
const User = require('../../models/userModel');
const { ObjectId } = require('../../utils');
const {TECHNICIAN}=require("../../utils/constants")
const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 }).populate('userId', 'name email');
    res.status(200).json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTicketByUserAssignedId = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log
    
    const tickets = await Ticket.find({ assignedTo: userId }).sort({ createdAt: -1 }).populate('userId', 'name email');
    res.status(200).json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTicketByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const tickets = await Ticket.find({ userId }).populate('userId', 'name email')
    // .populate("assignedTo","name email");
    const populatedTickets = await Promise.all(tickets.map(async (ticket) => {
      const { name, email, _id } = ticket.userId; 

      if (mongoose.Types.ObjectId.isValid(ticket.assignedTo)) {
        await ticket.populate('assignedTo', 'name email');
      }
      const assignedTo=ticket.assignedTo.name?ticket.assignedTo.name:ticket.assignedTo?ticket.assignedTo:""


      return ({...ticket.toObject(),name,email,userId:_id,assignedTo,assignedDetail:ticket.assignedTo});
    }));

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
const getFilterCompanyTickets = async (req, res) => {
  try {
   
    const {id,companyId}=req.user;

    const tickets = await Ticket.find({
      companyId: companyId, 
      $or: [
        { assignedTo: id },
        { assignedTo: '' }, 
      ]
    }).populate('userId', 'name email').populate('userId', 'name email')
    // .populate("assignedTo","name email");
    const populatedTickets = await Promise.all(tickets.map(async (ticket) => {
      const { name, email, _id } = ticket.userId; 

      if (mongoose.Types.ObjectId.isValid(ticket.assignedTo)) {
        await ticket.populate('assignedTo', 'name email');
      }
      const assignedTo=ticket.assignedTo.name?ticket.assignedTo.name:ticket.assignedTo?ticket.assignedTo:""


      return ({...ticket.toObject(),name,email,userId:_id,assignedTo,assignedDetail:ticket.assignedTo});
    }));

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
    // console.log("req==== user",req.user)
    const { userId, issue, description, issueLocation, status, assignedTo,images,companyId } = req.body;
    // const payload=req.body
 
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
   
    });

    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const updates = req.body;
    console.log("updates=====",updates)

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticketId' });
    }

    if (req.files) {
      if (req.files.images) {
        updates.images = req.files.images.map(file => file.path);
      }
      if (req.files.files) {
        updates.files = req.files.files.map(file => file.path);
      }
    }

    const ticket = await Ticket.findByIdAndUpdate(ticketId, updates, { new: true });
    res.status(200).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticketId' });
    }

    await Ticket.findByIdAndDelete(ticketId);
    res.status(200).json({ message: 'Ticket deleted successfully' });
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
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const newComment = {
      userId,
      text,
      images,
      files
    };

    ticket.comments.push(newComment);
    await ticket.save();

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports={
    createTicket,
    deleteTicket,
    getTicketByUserAssignedId,
    getTicketByUserId,
    getFilterCompanyTickets ,
    updateTicket,
    getAllTickets,
    addComment
}