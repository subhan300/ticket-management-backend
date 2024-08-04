const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { ObjectId } = require('mongoose').Types;


const formatTicketNumber=(ticketNo)=>{
    const lastTicketNumber = ticketNo
    const newTicketNumber = Number(lastTicketNumber) + 1;
    return String(newTicketNumber).padStart(3, '0');
}



const url = "http://localhost:5173/manager/inventory/create";
const data = {
    productName: "Fans",
    productImage: "",
    description: "Black fans",
    quantity: "34",
    usedItem: "",
    location: "Cantt Town",
    category: "electronics",
    status: "In Stock",
    productImages: ["http://res.cloudinary.com/dxhqcov11/image/upload/v1722806868/tracking-system/fans_sssfye.jpg"]
};

;


const generateQRCode = async () => {
    try {
        const secretKey = 'inventory-@@@';
        const jsonData = JSON.stringify(data);
        const token = jwt.sign(jsonData, secretKey);
        const fullUrl = `${url}/${token}`;
          let imgUrl= await QRCode.toDataURL(fullUrl)
        return imgUrl
    } catch (err) {
        console.error('Error generating QR code:', err);
    }
};


module.exports={ ObjectId,formatTicketNumber,generateQRCode}