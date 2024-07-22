const Ticket = require('../../models/ticketModel');

// Add a new comment to a ticket
const addComment = async (req, res) => {
    const { ticketId } = req.params;
    const { userId, text, images, files,createdAt } = req.body;

    try {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        const newComment = {
            userId,
            text,
            images,
            files,
            createdAt,
        };

        ticket.comments.unshift(newComment); // Add the new comment to the beginning of the comments array
        await ticket.save();

        // Emit event via Socket.io
        // req.io.emit('commentAdded', ticket);
        req.io.to(ticketId).emit('commentAdded', ticket.comments);

        res.status(201).json(ticket.comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const editComment = async (req, res) => {
    const { ticketId, commentId } = req.params;
    const { userId, text,  files ,createdAt} = req.body;

    try {
        console.log("working=====")
        const ticket = await Ticket.findOneAndUpdate(
            { _id: ticketId, 'comments._id': commentId, 'comments.userId': userId },
            { $set: { 'comments.$.text': text, 'comments.$.files': files, 'comments.$.updatedAt': new Date() ,
                'comments.$.createdAt':createdAt} },
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket or comment not found, or user not authorized' });
        }

        req.io.to(ticketId).emit('commentEdited', ticket.comments);

        res.status(200).json(ticket.comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteComment = async (req, res) => {
    const { ticketId, commentId } = req.params;
    const { userId } = req.body;
    try {
        
        const ticket = await Ticket.findOneAndUpdate(
            { _id: ticketId },
            { $pull: { comments: { _id: commentId, userId } } },
            { new: true }
        );
        console.log("deletd====",ticket)
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket or comment not found, or user not authorized' });
        }

        req.io.to(ticketId).emit('commentDeleted', ticket.comments);

        res.status(200).json(ticket.comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Fetch all tickets sorted by creation date in descending order
const getCommentsByTicketId = async (req, res) => {
    try {
        const { ticketId} = req.params;

        const tickets = await Ticket.find().sort({ createdAt: -1 });
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addComment,
    editComment,
    deleteComment,
    getCommentsByTicketId
};
