const UserItem = require("../../models/userItemsModel");
const getItemsGroupedByRoom = async (locationObjectId) => {
  try {
    const itemsGroupedByRoom = await UserItem.aggregate([
      { $match: { location: {$in:locationObjectId} } },  // Match based on location
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
      { $unwind: "$roomDetails" },  // Unwind the roomDetails array to flatten the data
      {
        $lookup: {
          from: "units",  // Lookup details from the "units" collection
          localField: "roomDetails.unit",  // Assuming roomDetails has a field `unitId`
          foreignField: "_id",  // Match on the unit's ID
          as: "unitDetails"  // Output as "unitDetails"
        }
      },
      { $unwind: "$unitDetails" },  // Unwind the unitDetails array to flatten the data
      { $match: { items: { $ne: [] } } }  // Filter out rooms with zero items (empty arrays)
    ]);

    return itemsGroupedByRoom;
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching grouped items by room.");
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