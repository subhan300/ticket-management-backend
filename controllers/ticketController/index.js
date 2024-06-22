const mongoose = require('mongoose');
const Ticket = require('../../models/ticketModel');
const User = require('../../models/userModel');
const { ObjectId } = require('../../utils');

const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().populate('userId', 'name email');
    res.status(200).json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTicketByUserAssignedId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const tickets = await Ticket.find({ assignedTo: userId }).populate('userId', 'name email');
    res.status(200).json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTicketByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
   
    const tickets = await Ticket.find({ userId }).populate('userId', 'name email');
    res.status(200).json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createTicket = async (req, res) => {
  try {
    const { userId, issue, description, issueLocation, status, assignedTo,images } = req.body;
   


    const ticket = new Ticket({
      userId,
      issue,
      description,
      issueLocation,
      status,
      assignedTo,
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
    updateTicket,
    getAllTickets,
    addComment
}