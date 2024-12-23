const QRCode = require("qrcode");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { createCanvas } = require("canvas");
const fs = require("fs");
const JsBarcode = require("jsbarcode");
const { updateStockStatus } = require("./inventoryUtils");
const { default: mongoose } = require("mongoose");
const { NotAssignedId, NotAssigned } = require("./constants");
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

const updateTicketAssignedMessage = (name, assignedTo,ticketNo,locationName) => {
  return `${name} have  assigned a  ticket # ${ticketNo} to ${assignedTo} of location ${locationName}`;
};

const technicianUpdateTicketAssignedMessage = (name, assignedTo,ticketNo,locationName) => {
  return `Ticket # ${ticketNo} is assigned by technician to himself ${name} of location ${locationName}`;
};
const updateTicketStatusMessage = (name, status, ticketNo,locationName) => {
  return `Ticket # ${ticketNo} is updated to  ${status} by ${name} of location ${locationName}`;
};

const updateStatusMessage = (name, status,ticketNo,locationName) => {
  return `Ticket # ${ticketNo} Status is updated to ${status} by ${name} of location ${locationName}`;
};
const ticketCreateMessage = (name,_,ticketNo,locationName) => {
  return `Ticket # ${ticketNo} is created by ${name} of location ${locationName} `;
};
const ticketUnAssignedMessage = (name, roles, ticketNo,locationName) => {
  const rolesList = roles.join(', '); // Convert roles array to a comma-separated string
  return `Ticket # ${ticketNo} is UnAssigned by ${name} (${rolesList}) of location ${locationName}`;
};
const updateBatchLaundryStatusMessage = (name, status, tickets,locationName) => {
  return `Tickets # ${tickets} is updated to  ${status} by ${name} of location ${locationName}`;
};
const handleLowTemperatureMessage=({room,temperature,threshold})=>{
  return `Temperature ${temperature} is below the threshold (${threshold}) of room ${room}.`
}


const getAssignedTo = async (ticketItem) => {
  if (mongoose.Types.ObjectId.isValid(ticketItem.assignedTo)) {
    await ticketItem.populate("assignedTo", "name email");
  }
  const assignedTo =
    ticketItem.assignedTo === NotAssignedId
      ? { name: NotAssigned, _id: NotAssignedId }
      : ticketItem.assignedTo;
  return assignedTo;
};
function generateSKU(name) {
  const getDate = new Date();
  const uniqueName = `${name}-${getDate}`;
  const hash = crypto.createHash("md5").update(uniqueName).digest("hex");
  const hashedSKU = parseInt(hash.substring(0, 5), 16);
  return hashedSKU; // or incrementalSKU, or hashedSKU
}
const populateTickets = async (tickets) => {
  return await tickets
    .populate("userId", "name email")
    .populate({
      path: "inventoryUsed.inventoryId",
      model: "Inventory",
      select: "productName productImage",
    })
    .populate({
      path: "room",
      populate: {
        path: "unit",
        model: "Unit",
      },
    }).populate({
      path: "comments.userId",        
      select: "name email"            
    })
    .sort({ createdAt: -1 });
};
const populateLaundryTickets = async (tickets) => {
  return await tickets
    .populate("userId", "name email")
    .populate({
      path: "userItems",
      model: "UserItem",
    })
    .populate({
      path: "room",
      populate: {
        path: "unit",
        model: "Unit",
      },
    })
    .populate({ path: "location", model: "Location" }).populate({
      path: "comments.userId",         // Populating the userId inside each comment
      select: "name email"             // Selecting the name and email of the user who commented
    })
    .sort({ createdAt: -1 });
};
const extractRoomAndUnit = (ticketItems) => {
  let ticket = ticketItems?.length ? ticketItems[0] : ticketItems;

  const room = {
    roomName: ticket?.room?.roomName || null,
    _id: ticket?.room?._id || null,
  };
  const unit = {
    name: ticket?.room?.unit?.name || null,
    _id: ticket?.room?.unit?._id || null,
  };
  const { name, email, _id } = ticket.userId;
  return { room, unit, getName: name, getEmail: email, getId: _id };
};
const laundryTicketStructure = async (populatedTickets) => {
  const { room, unit, getName, getEmail, getId } = extractRoomAndUnit(
    populatedTickets
  );
  if (populatedTickets.length) {
    return await Promise.all(
      populatedTickets.map(async (ticketItem) => {
        const { name, email, _id } = ticketItem.userId;
        if (mongoose.Types.ObjectId.isValid(ticketItem.assignedTo)) {
          await ticketItem.populate("assignedTo", "name email");
        }
        const assignedTo =
          ticketItem.assignedTo === NotAssignedId
            ? { name: NotAssigned, _id: NotAssignedId }
            : ticketItem.assignedTo;
        return {
          ...ticketItem.toObject(),
          assignedTo,
          name,
          email,
          userId: _id,
          room,
          unit,
        };
      })
    );
  } else {
    
    if (mongoose.Types.ObjectId.isValid(populatedTickets.assignedTo)) {
      await populatedTickets.populate("assignedTo", "name email");
    }
    const assignedTo =
      populatedTickets.assignedTo === NotAssignedId
        ? { name: NotAssigned, _id: NotAssignedId }
        : populatedTickets.assignedTo;
    return {
      ...populatedTickets.toObject(),
      name: getName,
      assignedTo,
      email: getEmail,
      userId: getId,
      room,
      unit,
    };
  }
};
const ticketStructure = async (ticket) => {
  if (Array.isArray(ticket)) {
    return await Promise.all(
      ticket.map(async (ticket) => {
      
         const   { name="", email="", _id=null } = ticket?.userId || {};
        
        
        const transformedInventoryUsed = ticket?.inventoryUsed.filter(val=>val.inventoryId)?.map((item) => ({
          _id: item?.inventoryId?._id,
          inventoryId:item?.inventoryId?._id,
          productName: item?.inventoryId?.productName,
          productImage: item?.inventoryId?.productImage,
          quantityUsed: item?.quantityUsed,
        }));
        if (mongoose.Types.ObjectId.isValid(ticket.assignedTo)) {
          await ticket.populate("assignedTo", "name email");
        }
        const assignedTo =
          ticket.assignedTo === NotAssignedId
            ? { name: NotAssigned, _id: NotAssignedId }
            : ticket.assignedTo;
        // for now need to add ternary oprator as changing data ,but remove it after that
        const Room = {
          roomName: ticket?.room?.roomName,
          _id: ticket.room?._id,
          SKU:ticket.room.SKU
        };
        const unit = {
          name: ticket?.room?.unit?.name,
          _id: ticket?.room?.unit?._id,
        };
        return {
          ...ticket.toObject(),
          name,
          email,
          userId: _id,
          room: Room,
          unit,
          assignedTo,
          inventoryUsed: transformedInventoryUsed?.length
            ? transformedInventoryUsed
            : [],
          assignedToColumn: assignedTo._id,
        };
      })
    );
  } else {
    const { name, email, _id } = ticket.userId || {};
    const transformedInventoryUsed = ticket?.inventoryUsed.filter(val=>val.inventoryId)?.map((item) => ({
      _id: item?.inventoryId?._id,
      inventoryId:item?.inventoryId?._id,
      productName: item.inventoryId.productName,
      productImage: item.inventoryId.productImage,
      quantityUsed: item.quantityUsed,
    }));
    if (mongoose.Types.ObjectId.isValid(ticket.assignedTo)) {
      await ticket.populate("assignedTo", "name email");
    }
    const assignedTo =
      ticket.assignedTo === NotAssignedId
        ? { name: NotAssigned, _id: NotAssignedId }
        : ticket.assignedTo;
    const Room = { roomName: ticket?.room?.roomName, _id: ticket?.room?._id };
    const unit = { name: ticket?.room?.unit?.name, _id: ticket?.room?.unit?._id };
    return {
      ...ticket.toObject(),
      name,
      email,
      userId: _id,
      assignedTo,
      room: Room,
      unit,
      inventoryUsed: transformedInventoryUsed?.length
        ? transformedInventoryUsed
        : [],
      assignedToColumn: assignedTo._id,
    };
  }
};
const covertId=(id)=>{
  return new mongoose.Types.ObjectId(id)
}
module.exports = {
  updateBatchLaundryStatusMessage,
  covertId,
  ticketStructure,
  populateTickets,
  updateStockStatus,
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
  updateTicketStatusMessage,
  updateTicketAssignedMessage,
  getAssignedTo ,
  handleLowTemperatureMessage
};
