const broadcastAssignedMessage = (name, assignedTo,ticketNo) => {
  return `${name} have  assigned a  Laundary ticket # ${ticketNo} to ${assignedTo}`;
};
const broadcastUnAssignedMessage = (name,ticketNo,role) => {
  return `Ticket # ${ticketNo} is UnAssigned  by ${role} ${name}`;
};
const messageToAssignedUser=(ticketNo)=>{
  return `Ticket # ${ticketNo} is assigned to you `
}

const updateTicketStatusMessage = (name, status, ticketNo) => {
  return `Ticket #${ticketNo} is update to  ${status} by ${name}`;
};

const ticketCreateMessage = (name,ticketNo) => {
  return `Laundary Ticket # ${ticketNo}  is created by ${name}`;
};



module.exports={
    ticketCreateMessage,
    updateTicketStatusMessage,
    messageToAssignedUser,
    broadcastAssignedMessage,
    broadcastUnAssignedMessage
    
}