const updateTicketAssignedMessage = (name, assignedTo) => {
  return `${name} have  assigned a  ticket to ${assignedTo}`;
};
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
    updateTicketStatusMessage
    
}