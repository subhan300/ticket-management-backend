// stockItemController.js

const Inventory = require("../../models/inventoryModel");
const createInventoryItem = async (req, res) => {
  const {
    productName,
    productImage,
    description,
    quantity,
    location,
    category,
    status,
    usedItem
  } = req.body;

  try {
    const item = new Inventory({
      productName,
      productImage,
      description,
      quantity,
      location,
      category,
      status,
      usedItem
    });
    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error("Error creating stock item:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
const getAllItems = async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Function to get stock items by company ID
const getInventoryItemsByCompany = async (req, res) => {
  const { companyId } = req.params;

  try {
    const items = await Inventory.find({ companyId });
    res.json(items);
  } catch (err) {
    console.error("Error fetching inventory items:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
const getInventoryItemShortDetail = async (req, res) => {
    const { companyId } = req.params;
  
    try {
      const items = await Inventory.find({ companyId }).select("productName productImage");
      res.json(items);
    } catch (err) {
      console.error("Error fetching inventory items:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  };
// Update an inventory item
const updateInventoryItem = async (req, res) => {
  try {
    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedItem) return res.status(404).json({ error: "Item not found" });
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete an inventory item
const deleteInventoryItem = async (req, res) => {
  try {
    const deletedItem = await Inventory.findByIdAndDelete(
      req.params.inventoryId
    );
    if (!deletedItem) return res.status(404).json({ error: "Item not found" });
    res.json(deletedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createBulkInventoryItem = async (req, res) => {
 
  
    try {
        const  items  = req.body;
        const {companyId}=req.params
        console.log("items",items)
        if (!Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ message: 'Invalid items array' });
        }
      const createdItems = await Inventory.insertMany(items);
      res.status(201).json(createdItems);
    } catch (err) {
      res.status(500).json({ message: 'Error creating inventory items', error: err.message });
    }
  };

module.exports = {
  getInventoryItemsByCompany,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getAllItems,
  createBulkInventoryItem,
  getInventoryItemShortDetail
};
