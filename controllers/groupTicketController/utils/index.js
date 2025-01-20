const { default: mongoose } = require("mongoose");
const { NotAssignedId, NotAssigned } = require("../../../utils/constants");
const populateTickets = async (tickets) => {
    // console.log("__tickets populate",tickets)
    return await tickets
      .populate({path:"userId", select:"name email",model:"User"})
      .populate({
        path: "inventoryUsed.inventoryId",
        model: "Inventory",
        select: "productName productImage",
      })
      .populate({
        path: "rooms",
        populate: {
          path: "unit",
          model: "Unit",
        },
      }).populate({path:"units",select:"name"}).populate({
        path: "comments.userId",        
        select: "name email"            
      })
      .sort({ createdAt: -1 });
  };

  const  transformTicket = async (ticket) => {
    console.log(
        "ticket trnasofrm",ticket
    )
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
          console.log("ticket.assignedTo.length",ticket.assignedTo.length)
          if (mongoose.Types.ObjectId.isValid(ticket.assignedTo.length)) {
            await ticket.populate("assignedTo", "name email");
          }
          const assignedTo =
            ticket.assignedTo.length
              ? { name: NotAssigned, _id: NotAssignedId }
              : ticket.assignedTo;
         
          return {
            ...ticket.toObject(),
            name,
            email,
            userId: _id,
            
            assignedTo,
            inventoryUsed: transformedInventoryUsed?.length
              ? transformedInventoryUsed
              : [],
            // assignedToColumn: assignedTo._id,
          };
        })
      );
    } else if(ticket !==null) {
      const { name, email, _id } = ticket.userId || {};
      const transformedInventoryUsed = ticket?.inventoryUsed.filter(val=>val.inventoryId)?.map((item) => ({
        _id: item?.inventoryId?._id,
        inventoryId:item?.inventoryId?._id,
        productName: item.inventoryId.productName,
        productImage: item.inventoryId.productImage,
        quantityUsed: item.quantityUsed,
      }));
      if (mongoose.Types.ObjectId.isValid(ticket.assignedTo.length)) {
        await ticket.populate("assignedTo", "name email");
      }
      const assignedTo =
        ticket.assignedTo.length
          ? { name: NotAssigned, _id: NotAssignedId }
          : ticket.assignedTo;
   
      return {
        ...ticket.toObject(),
        name,
        email,
        userId: _id,
        assignedTo,
        inventoryUsed: transformedInventoryUsed?.length
          ? transformedInventoryUsed
          : [],
        // assignedToColumn: assignedTo._id,
      };
    }else{
        return []
    }
  };

  module.exports={
    transformTicket,populateTickets
  }