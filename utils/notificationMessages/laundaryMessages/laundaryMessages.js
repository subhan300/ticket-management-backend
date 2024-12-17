const broadcastAssignedMessage = (name, assignedTo,ticketNo,locationName) => {
  return `${name} have  assigned a  Laundary ticket # ${ticketNo} to ${assignedTo} of location ${locationName}`;
};
const broadcastUnAssignedMessage = (name,ticketNo,role,locationName) => {
  return `Ticket # ${ticketNo} is UnAssigned  by ${role} ${name} of location ${locationName}`;
};
const messageToAssignedUser=(ticketNo,locationName)=>{
  return `Ticket # ${ticketNo} is assigned to you of location ${locationName} `
}

const updateTicketStatusMessage = (name, status, ticketNo) => {
  return `Ticket #${ticketNo} is updated to  ${status} by ${name}`;
};

const ticketCreateMessage = (name,_,ticketNo,locationName) => {
  return `Laundary Ticket # ${ticketNo}  is created by ${name} of location ${locationName}`;
};



module.exports={
    ticketCreateMessage,
    updateTicketStatusMessage,
    messageToAssignedUser,
    broadcastAssignedMessage,
    broadcastUnAssignedMessage
    
}