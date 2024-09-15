const broadcastAssignedMessage = (name, assignedTo) => {
  return `${name} have  assigned a  Laundary ticket to ${assignedTo}`;
};
const broadcastUnAssignedMessage = (name, role) => {
  return `Ticket is UnAssigned  by ${role} ${name}`;
};
const messageToAssignedUser=(ticketNo)=>{
  return `Ticket # ${ticketNo} is assigned to you `
}
const managerUpdateTicketAssignedMessage = (name, assignedTo) => {
  return `Ticket is assigned to ${assignedTo} by Manager ${name}`;
};
const technicianUpdateTicketAssignedMessage = (name, assignedTo) => {
  return `Ticket is assigned by technician to himself ${name}`;
};
const updateTicketStatusMessage = (name, status, ticketNo) => {
  return `Ticket #${ticketNo} is update to  ${status} by ${name}`;
};
const updateStatusMessage = (name, status) => {
  return `Ticket Status is updated to ${status} by ${name}`;
};
const ticketCreateMessage = (name) => {
  return `Laundary Ticket is created by ${name}`;
};
const ticketUnAssignedMessage = (name, role) => {
  return `Ticket is UnAssigned  by ${role} ${name}`;
};


module.exports={
    ticketCreateMessage,
    updateTicketStatusMessage,
    messageToAssignedUser,
    broadcastAssignedMessage,
    broadcastUnAssignedMessage
    
}