// stockItemController.js

const Inventory = require("../../models/inventoryModel");
const { updateStockStatus } = require("../../utils");

const createInventoryItem = async (req, res) => {
  const { companyId, name } = req.user;
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
    brand,
    modelNo,
    size,
    room,
    condition,
    supplierName,
    supplierContactNo,
    expireDate,
    warranty,
    threshold,
    purchaseDate,
    unit,
  } = req.body;

  try {
    const item = new Inventory({
      unit,
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
      brand,
      modelNo,
      size,
      room,
      condition,
      supplierName,
      supplierContactNo,
      expireDate,
      warranty,
      threshold,
      // inventoryUsed:[],
      purchaseDate,
      receivingHistory: [
        {
          receivedDate: purchaseDate,
          receivedQty: quantity,
          receivedBy: name,
          price,
          warranty,
          room,
        },
      ],
    });
    const savedItem = await item.save();

    const populatedItem = await Inventory.findById(savedItem._id)
      .populate("room")
      .populate("location")
      .populate("unit")
      .lean();
    res.status(201).json(populatedItem);
  } catch (err) {
    console.error("Error creating inventory item:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
const receiveInventory = async (req, res) => {
  try {
    const {name}=req.user
    const {
      _id,
      quantity,
      warranty,
      price,
      room,
      purchaseDate,
    } = req.body;

    // Find the inventory item
    const inventory = await Inventory.findById(_id)
   console.log("room",room,purchaseDate)
    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    // Update the quantity and add an entry to receivingHistory
    inventory.quantity += quantity;
    inventory.receivingHistory.push({
      receivedDate:purchaseDate,
      receivedQty:quantity,
      receivedBy:name,
      warranty,
      price,
      room,
    });

    // Save the updated inventory
    await inventory.save()
    const getInventory = await Inventory.findById(_id).populate("unit").populate("room").populate("location").lean();;
    res.status(200).json(
      getInventory);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Failed to receive inventory", error });
  }
};

const updateInventoryItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const payload = req.body;

    const item = await Inventory.findById(productId).lean();
    console.log("item==", item);
    if (!item) return res.status(404).json({ error: "Item not found" });

    // Update stock status using the utility function
    getStatus = {};
    if (payload.usedItem) {
      getStatus = updateStockStatus({ ...item, ...payload });
      payload.status = getStatus.status;
    }
    if (payload.status === "Out of Stock" && getStatus.availableQty < 0) {
      return res
        .status(400)
        .send("Inventory is out of stock ,can't order that much");
    }
    // Update the inventory item
    const updatedItem = await Inventory.findByIdAndUpdate(productId, payload, {
      new: true,
    })
      .populate("room")
      .populate("unit")
      .populate("location");
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllItems = async (req, res) => {
  try {
    const items = await Inventory.find()
      .populate("unit")
      .populate("room")
      .populate("location"

      )
      console.log("items===",items)
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getProductBySku = async (req, res) => {
  const { SKU } = req.params;

  try {
    const items = await Inventory.findOne({ SKU })
      .populate("unit")
      .populate("room")
      .populate("location");
    if (!items) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(items);
  } catch (err) {
    console.error("Error fetching inventory items:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Function to get stock items by company ID
const getInventoryItemsByCompany = async (req, res) => {
  const { companyId } = req.user;

  try {
    const items = await Inventory.find({ companyId })
      .populate({
        path: "inventoryUsed.room",
        select: "roomName unit",
      })
      .populate("unit")
      .populate("room")
      .populate("location")
    const transFormInventory = items.map((val) => ({
      ...val.toObject(),
      // quantityUsed: 1,
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
      // .lean();
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

const deleteInventoryItem = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const deletedItem = await Inventory.findByIdAndDelete(inventoryId);

    res.status(200).json("deleted");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteInventory = async (req, res) => {
  try {
    await Inventory.deleteMany({});

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
  getProductBySku,
  getInventoryItemsByCompany,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getAllItems,
  createBulkInventoryItem,
  getInventoryItemShortDetail,
  deleteInventory,
  receiveInventory,
};
