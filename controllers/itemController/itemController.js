const Item = require("../../models/itemModel"); // Assuming your model is named "Item"

const getAllItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ item: 1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving items", error });
  }
};

const createItemsInBulk = async (req, res) => {
  try {
    const items = req.body; 
    const createdItems = await Item.insertMany(items);
    res.status(201).json(createdItems);
  } catch (error) {
    res.status(500).json({ message: "Error creating items", error });
  }
};

// Update item by ID
const updateItemById = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const updatedItem = await Item.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Error updating item", error });
  }
};
const deleteItemById = async (req, res) => {
    const { id } = req.params;
   
    try {
      const updatedItem = await Item.deleteOne(id, updatedData, { new: true });
      if (!updatedItem) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.status(200).json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Error deleting item", error });
    }
  };

  const deleteDuplicates = async (req, res) => {
    console.log("____________here")
    try {
      console.log("____________here")
      // Step 1: Find all duplicate items by the 'item' field (name)
      const duplicates = await Item.aggregate([
        {
          $group: {
            _id: { item: "$item" }, // Group by 'item' field (the name of the item)
            count: { $sum: 1 }, // Count the number of items with the same name
            ids: { $push: "$_id" } // Collect all item IDs with the same name
          }
        },
        {
          $match: { count: { $gt: 1 } } // Only get items where count > 1 (duplicates)
        }
      ]);
  
      // Step 2: Loop through the duplicates and delete all except one
      for (const duplicate of duplicates) {
        const idsToDelete = duplicate.ids.slice(1); // Exclude the first one (keep it)
        
        // Delete all the duplicate items by their IDs
        await Item.deleteMany({ _id: { $in: idsToDelete } });
      }
  
      res.status(200).json({ message: "All duplicates deleted successfully" });
    } catch (error) {
      console.log("Error deleting duplicates:", error);
      res.status(500).json({ message: "ssError deleting duplicates", error });
    }
  };
  
  
module.exports = {
  deleteDuplicates,
    deleteItemById ,
  getAllItems,
  createItemsInBulk,
  updateItemById,
};
