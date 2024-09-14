// stockItemController.js

const Product= require("../../models/productsModel");
const { generateSKU } = require("../../utils");

const createProduct = async (req, res) => {
  const {
    productName,
    productImage,
    category,
    price,location,status
  } = req.body;

  try {
    const generateSku = generateSKU(
      status
    );
    const item = new Product({
        productName,
        productImage,
        category,
        price,
        SKU:generateSku,
        location,status,
    });
    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error("Error creating Product item:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
const getProducts = async (req, res) => {
  try {
    const items = await Product.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Function to get stock items by company ID
const getProductById = async (req, res) => {
  const { SKU } = req.params;

  try {
    const items = await Product.findOne({ SKU });
    if(!items){
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(items);
  } catch (err) {
    console.error("Error fetching inventory items:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const updateProduct = async (req, res) => {
    try {
        const {SKU}=req.params
      const updatedItem = await Product.findOneAndUpdate(
        { SKU}, // Filter object
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
const deleteProduct= async (req, res) => {
  try {
    const deletedItem = await Product.findOneAndDelete({ SKU: req.params.SKU });
    if (!deletedItem) return res.status(404).json({ error: "Item not found" });
    res.json(deletedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createBulkProduct = async (req, res) => {
  try {
    const items = req.body;
    console.log("items", items);
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid items array" });
    }
    const createdItems = await Product.insertMany(items);
    res.status(201).json(createdItems);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating inventory items", error: err.message });
  }
};

module.exports = {
    deleteProduct,
    updateProduct,
    createBulkProduct,
    createProduct,
    getProductById,
    getProducts,
    
};
