const QRCode = require("qrcode");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { createCanvas } = require("canvas");
const fs = require("fs");
const JsBarcode = require("jsbarcode");
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
function generateBarcode(text) {
  console.log("text==", text);
  const options = {
    format: "CODE128",
    text,
    font: "monospace",
    font_size: 18,
    text_margin: 5,
    width: 2,
    height: 50,
    margin: 10,
  };
  const canvas = createCanvas();
  JsBarcode(canvas, text, options);
  return canvas.toBuffer();
}

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
  return `Ticket is created by ${name}`;
};
const ticketUnAssignedMessage = (name, role) => {
  return `Ticket is UnAssigned  by ${role} ${name}`;
};

// export const selectMessage = (messageName, name, status) => {
//   switch (messageName) {
//     case "status":
//       return updateTicketStatusMessage(name, status);
//     case "assignedTo":
//       return updateTicketAssignedMessage(name);

//   }
// };
function generateSKU(name) {
  const getDate = new Date();
  const uniqueName = `${name}-${getDate}`;
  const hash = crypto.createHash("md5").update(uniqueName).digest("hex");
  const hashedSKU = parseInt(hash.substring(0, 5), 16);
  console.log("hased ====", hashedSKU);
  return hashedSKU; // or incrementalSKU, or hashedSKU
}
const populateLaundryTickets = async (tickets) => {
  return await tickets
    .populate("userId", "name email")
    .populate({
      path: "userItems",
      model: "UserItem",
      // select: "",
    }).populate("resident", "name email")
    .sort({ createdAt: -1 });
};
const laundryTicketStructure = async (populatedTickets) => {
  return await Promise.all(
    populatedTickets.map(async (ticketItem) => {
      const { name, email, _id } = ticketItem.userId;

      return {
        ...ticketItem.toObject(),
        name,
        email,
        userId: _id,
      };
    })
  );
};
module.exports = {
  laundryTicketStructure,
  populateLaundryTickets,
  generateSKU,
  generateBarcode,
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
