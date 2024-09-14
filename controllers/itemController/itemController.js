const Item = require("../../models/itemModel"); // Assuming your model is named "Item"

const getAllItems = async (req, res) => {
  try {
    const items = await Item.find();
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

module.exports = {
    deleteItemById ,
  getAllItems,
  createItemsInBulk,
  updateItemById,
};
