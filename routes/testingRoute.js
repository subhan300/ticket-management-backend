// userRoutes.js

const express = require('express');
const router = express.Router();
const testingController = require('../controllers/testingController');

// Route for creating a new user
router.get('/', testingController.testGet);

// Other routes like GET /users/:id, PUT /users/:id, DELETE /users/:id, etc.


module.exports = router;


// const handleStatusNotification = async (req, updates, managersCollection, ticket) => {
//     const {  status } = updates;
//     const technicianSocketId = connectedUsers[assignedTo];
//     const { role, name } = req.user;
//     if (role === 'USER' && status) {
//       if(ticket.assignedTo._id !== NotAssignedId){
//       await notifyAssignedUserAboutStatus(ticket,req.user);
//       }
//       if (managersCollection.length) await notifyManagersAboutStatus(req,name,ticket,managersCollection,updateTicketAssignedMessage);
//     }
  
//     if (role === 'MANAGER' && assignedTo) {
//       await notifyAssignedUserAboutStatus(ticket,req.user);
//       const userSocketId = connectedUsers[ticket.userId];
//       sendSocketNotification(req,userSocketId, `Ticket is assigned by Manager ${name} to ${ticket.assignedTo.name}`, updates._id);
//       await createNotification(ticket.userId, managerUpdateTicketAssignedMessage(name, ticket.assignedTo.name), updates._id);
//     }
  
//     if (role === 'TECHNICIAN' && assignedTo) {
//       const userSocketId = connectedUsers[ticket.userId];
//       sendSocketNotification(req,userSocketId, `Ticket is assigned by Technician ${name} to himself`, updates._id);
//       await createNotification(ticket.userId, technicianUpdateTicketAssignedMessage(name), updates._id);
//       if (managersCollection.length) await notifyManagersAboutStatus(req,name,ticket,managersCollection,technicianUpdateTicketAssignedMessage);
//     }
//   };