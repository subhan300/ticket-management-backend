const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { ObjectId } = require("mongoose").Types;

const formatTicketNumber = (ticketNo) => {
  const lastTicketNumber = ticketNo;
  const newTicketNumber = Number(lastTicketNumber) + 1;
  return String(newTicketNumber).padStart(3, "0");
};

const url =
  "https://ticket-managment-frotnend.vercel.app/manager/inventory/create";
const data = {
  productName: "Fans",
  productImage: "",
  description: "Black fans",
  quantity: "34",
  usedItem: "",
  location: "Cantt Town",
  category: "electronics",
  status: "In Stock",
  productImages: [
    "http://res.cloudinary.com/dxhqcov11/image/upload/v1722806868/tracking-system/fans_sssfye.jpg",
  ],
};

const generateQRCode = async () => {
  try {
    const secretKey = "inventory-@@@";
    const jsonData = JSON.stringify(data);
    const token = jwt.sign(jsonData, secretKey);
    const fullUrl = `${url}/${token}`;
    let imgUrl = await QRCode.toDataURL(fullUrl);
    return imgUrl;
  } catch (err) {
    console.error("Error generating QR code:", err);
  }
};

const updateTicketAssignedMessage = (name,assignedTo) => {
  return `${name} have  assigned a  ticket to ${assignedTo}`;
};
const managerUpdateTicketAssignedMessage = (name,assignedTo) => {
  return `Ticket is assigned to ${assignedTo} by Manager ${name}`;
};
const technicianUpdateTicketAssignedMessage = (name,assignedTo) => {
  return `Ticket is assigned by technician to himself ${name}`;
};
const updateTicketStatusMessage = (name, status,ticketNo) => {
  return `Ticket #${ticketNo} is update to  ${status} by ${name}`;
};
const updateStatusMessage=(name,status)=>{
  return `Ticket Status is updated to ${status} by ${name}`
}
const  ticketCreateMessage=(name)=>{
  return `Ticket is created by ${name}`
}
const  ticketUnAssignedMessage=(name,role)=>{
  return `Ticket is UnAssigned  by ${role} ${name}`
}

// export const selectMessage = (messageName, name, status) => {
//   switch (messageName) {
//     case "status":
//       return updateTicketStatusMessage(name, status);
//     case "assignedTo":
//       return updateTicketAssignedMessage(name);
    
//   }
// };

module.exports = {
  ticketUnAssignedMessage,
  ticketCreateMessage,
  updateStatusMessage,
  technicianUpdateTicketAssignedMessage,
  ObjectId,
  formatTicketNumber,
  generateQRCode,
  managerUpdateTicketAssignedMessage,
  updateTicketStatusMessage,
  updateTicketAssignedMessage,
};
