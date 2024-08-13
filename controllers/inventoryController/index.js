// stockItemController.js

const Inventory = require("../../models/inventoryModel");
const createInventoryItem = async (req, res) => {
  const { companyId } = req.user;
  const {
    productName,
    productImage,
    description,
    quantity,
    location,
    category,
    status,
    usedItem,
    SKU,
    price,
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
      usedItem,
      companyId,
      SKU,
      price,
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
  const { companyId } = req.user;

  try {
    const items = await Inventory.find({ companyId }).lean();
    const transFormInventory = items.map((val) => ({
      ...val,
      quantityUsed: 1,
      inventoryId: val._id,
    }));
    res.json(transFormInventory);
  } catch (err) {
    console.error("Error fetching inventory items:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
const getInventoryItemShortDetail = async (req, res) => {
  const { companyId } = req.user;

  try {
    const items = await Inventory.find({ companyId })
      .select("productName productImage")
      .lean();
    console.log("items===", items);
    const transFormInventory = items.map((val) => ({
      ...val,
      quantityUsed: 1,
      inventoryId: val._id,
    }));
    res.json(transFormInventory);
  } catch (err) {
    console.error("Error fetching inventory items:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
// Update an inventory item
const updateInventoryItem = async (req, res) => {
  try {
    const {productId}=req.params
    const payload=req.body
    const updatedItem = await Inventory.findByIdAndUpdate(
      productId,
      payload,
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
    const {inventoryId}=  req.params
    console.log("onventory===",req.params)
    const deletedItem = await Inventory.findByIdAndDelete(
      inventoryId
    );
    console.log("delet item",deletedItem)
    
    res.status(200).json("deleted");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createBulkInventoryItem = async (req, res) => {
  try {
    const items = req.body;
    const { companyId } = req.params;
    console.log("items", items);
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid items array" });
    }
    const createdItems = await Inventory.insertMany(items);
    res.status(201).json(createdItems);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating inventory items", error: err.message });
  }
};

module.exports = {
  getInventoryItemsByCompany,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getAllItems,
  createBulkInventoryItem,
  getInventoryItemShortDetail,
};
