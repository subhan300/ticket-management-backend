const Ticket = require("../../models/ticketModel");
const LaundryTicket = require("../../models/laundryModel");
const { default: mongoose } = require("mongoose");

// Add a new comment to a ticket
const addComment = async (req, res) => {
  const { ticketId } = req.params;
  const {
    userId,
    text,
    images,
    files,
    createdAt,
    isSystemGenerated,
    commentCollectionName,
  } = req.body;

  // Validate input
  if (!ticketId || !userId || !text) {
    return res.status(400).json({ message: "Missing required fields: ticketId, userId, or text" });
  }

  // Define the ticket model based on the collection name
  let TicketModel;
  if (commentCollectionName === "laundryTicket") {
    TicketModel = LaundryTicket;
  } else {
    TicketModel = Ticket;
  } 
  try {
    // Find the ticket
    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Create the new comment
    const newComment = {
      userId,
      text,
      images,
      files,
      isSystemGenerated,
      createdAt,
    };

    // Add the new comment to the beginning of the comments array
    ticket.comments.unshift(newComment);

    // Save the ticket with the new comment
    await ticket.save();

    // Populate the comments with user data (name and email)
    const populatedTicket = await TicketModel.findById(ticketId)
      .populate({
        path: "comments.userId",
        select: "name email", // Populating only name and email fields of the user
      });

    // Emit the new comment via Socket.io
    const formattedComments = populatedTicket.comments.map(comment => ({
      ...comment.toObject(),
  
    }));

    // Emit the new comment list to clients
    req.io.to(ticketId).emit("commentAdded", formattedComments);

    // Respond with the updated comments
    res.status(201).json(formattedComments);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: error.message });
  }
};
const getTicketWithComments = async (ticketId, commentCollectionName) => {
  let ticket;
  // Handle fetching LaundryTicket or Ticket based on collection name
  if (commentCollectionName === "laundryTicket") {
    ticket = await LaundryTicket.findById(ticketId).populate({
      path: "comments.userId", // Populate userId in each comment
      select: "name email",    // Only select name and email
    });
  } else {
    ticket = await Ticket.findById(ticketId).populate({
      path: "comments.userId", // Populate userId in each comment
      select: "name email",    // Only select name and email
    });
  }

  return ticket;
};

const addCommentFunction = async (payload) => {
  const { commentCollectionName, ticketId, userId, text, isSystemGenerated, createdAt } = payload;

  try {
    // Fetch the ticket using the helper function
    const ticket = await getTicketWithComments(ticketId, commentCollectionName);

    if (!ticket) {
      return { status: 404, message: "Ticket not found" };
    }

    // Prepare the new comment
    const newComment = {
      userId: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null,
      text,
      isSystemGenerated,
      createdAt,
    };

    // Add the new comment to the beginning of the comments array
    ticket.comments.unshift(newComment);
    await ticket.save();

    // Format the comments for response (without internal Mongoose methods)
    const formatComments = ticket.comments.map(comment => ({
      ...comment.toObject(),
    }));

    // Return the formatted comments
    return { status: 201, comments: formatComments };
    
  } catch (error) {
    console.error("Error adding comment:", error);
    return { status: 500, message: error.message };
  }
};
const editComment = async (req, res) => {
  const { ticketId, commentId, userId } = req.params;
  const { text, files, createdAt, commentCollectionName } = req.body;

  try {
    // Fetch the ticket using the helper function
    const ticket = await getTicketWithComments(ticketId, commentCollectionName);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket or comment not found, or user not authorized",
      });
    }

    // Find the comment by commentId and userId, then update it
    const comment = ticket.comments.find(c => c._id.toString() === commentId && c.userId.toString() === userId);
    
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found or user is not authorized to edit this comment",
      });
    }

    // Update the comment fields
    comment.text = text;
    comment.files = files;
    comment.updatedAt = new Date();
    comment.createdAt = createdAt;

    // Save the updated ticket
    await ticket.save();

    // Format the comments for response
    const formatComments = ticket.comments.map(comment => ({
      ...comment.toObject(),
   
    }));

    // Emit the updated comment list via Socket.io
    req.io.to(ticketId).emit("commentEdited", formatComments);

    // Send the updated comments as the response
    res.status(200).json(formatComments);

  } catch (error) {
    console.error("Error editing comment:", error);
    res.status(500).json({ message: error.message });
  }
};

// const editComment = async (req, res) => {
//   const { ticketId, commentId, isSystemGenerated } = req.params;
//   const { userId, text, files, createdAt,commentCollectionName } = req.body;

//   try {
//     let ticket;
//     if (commentCollectionName === "laundryTicket") {
//       ticket = await LaundryTicket.findOneAndUpdate(
//         { _id: ticketId, "comments._id": commentId, "comments.userId": userId },
//         {
//           $set: {
//             "comments.$.text": text,
//             "comments.$.files": files,
//             "comments.$.updatedAt": new Date(),
//             "comments.$.createdAt": createdAt,
//           },
//         },
//         { new: true }
//       ) .populate({
//         path: "comments.userId",         // Populating the userId inside each comment
//         select: "name email"             // Selecting the name and email of the user who commented
//       })
  
//     } else {
//       ticket = await Ticket.findOneAndUpdate(
//         { _id: ticketId, "comments._id": commentId, "comments.userId": userId },
//         {
//           $set: {
//             "comments.$.text": text,
//             "comments.$.files": files,
//             "comments.$.updatedAt": new Date(),
//             "comments.$.createdAt": createdAt,
//           },
//         },
//         { new: true }
//       ) .populate({
//         path: "comments.userId",         // Populating the userId inside each comment
//         select: "name email"             // Selecting the name and email of the user who commented
//       })
  
//     }
    
//     if (!ticket) {
//       return res
//         .status(404)
//         .json({
//           message: "Ticket or comment not found, or user not authorized",
//         });
//     }

//     req.io.to(ticketId).emit("commentEdited", ticket.comments);

//     res.status(200).json(ticket.comments);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const deleteComment = async (req, res) => {
  const { ticketId, commentId } = req.params;
  const { userId } = req.body;
  try {
    let ticket;
    if (commentCollectionName === "laundryTicket") {
      ticket = await LaundryTicket.findOneAndUpdate(
        { _id: ticketId },
        { $pull: { comments: { _id: commentId, userId } } },
        { new: true }
      );
    } else {
      ticket = await Ticket.findOneAndUpdate(
        { _id: ticketId },
        { $pull: { comments: { _id: commentId, userId } } },
        { new: true }
      );
    }
   
    console.log("deletd====", ticket);
    if (!ticket) {
      return res
        .status(404)
        .json({
          message: "Ticket or comment not found, or user not authorized",
        });
    }

    req.io.to(ticketId).emit("commentDeleted", ticket.comments);

    res.status(200).json(ticket.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch all tickets sorted by creation date in descending order
const getCommentsByTicketId = async (req, res) => {
  try {
    const { ticketId } = req.params;

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
  getCommentsByTicketId,
  addCommentFunction
};
