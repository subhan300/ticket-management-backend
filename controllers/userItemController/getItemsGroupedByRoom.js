const UserItem = require("../../models/userItemsModel");

const getItemsGroupedByRoom = async (locationObjectId) => {
    try {
      const itemsGroupedByRoom = await UserItem.aggregate([
        { $match: { location: locationObjectId } },  // Match based on location
        {
          $group: {
            _id: "$room",  // Group by room
            items: { $push: "$$ROOT" }  // Push all the item data
          }
        },
        {
          $lookup: {
            from: "rooms",  // Lookup details from the "rooms" collection
            localField: "_id",  // Match the room ID
            foreignField: "_id", 
            as: "roomDetails"  // Output as "roomDetails"
          }
        },
        { $unwind: "$roomDetails" }  // Unwind the roomDetails array to flatten the data
      ]);
      
      return itemsGroupedByRoom;  // Return the grouped items
    } catch (error) {
      console.error("Error in getItemsGroupedByRoom:", error);
      throw error;  // Handle or rethrow the error
    }
  };
  
  const getItemsGroupedByRoomForIds = async (room) => {
    try {
      const itemsGroupedByRoom = await UserItem.aggregate([
        { $match: { room} },  // Match items by their IDs
        {
          $group: {
            _id: "$room",  // Group by room
            items: { $push: "$$ROOT" }  // Push all the item data
          }
        },
        {
          $lookup: {
            from: "rooms",  // Lookup room details from the "rooms" collection
            localField: "_id",  // Match the room ID
            foreignField: "_id", 
            as: "roomDetails"  // Output as "roomDetails"
          }
        },
        { $unwind: "$roomDetails" }  // Unwind the roomDetails array to flatten the data
      ]);
      
      return itemsGroupedByRoom;  // Return the grouped items
    } catch (error) {
      console.error("Error in getItemsGroupedByRoomForIds:", error);
      throw error;  // Handle or rethrow the error
    }
  };
  
  module.exports={getItemsGroupedByRoom,getItemsGroupedByRoomForIds}