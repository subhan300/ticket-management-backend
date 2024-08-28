const UserItem = require('../../models/userItemsModel');
const { generateSKU } = require('../../utils');

// Create a new item
const createItem = async (req, res) => {
    try {
        const generateSku = generateSKU(`${req.body.room}-${req.body.itemName}`);
        const newItem = new UserItem({...req.body,SKU:generateSku});
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createBulkItem = async (req, res) => {
    try {
        // Ensure each item in the request body includes the user ID
        const itemsWithUser=req.body
       
        const addSkuInTtems=itemsWithUser.map(val=>({...val,SKU:generateSKU(`${val.itemName}-${val.category}`)}))
        const savedItems = await UserItem.insertMany(addSkuInTtems);
        res.status(201).json(savedItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Get all items for a user
const getUserItemsByRoom = async (req, res) => {
    try {
        const {room}=req.params;
        const items = await UserItem.find({room});
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a specific item
const getItemById = async (req, res) => {
    try {
        const {SKU}=req.params
        console.log("sku",SKU)
        const item = await UserItem.findOne({SKU });
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update an item
const updateItem = async (req, res) => {
    try {
        const {itemId}=req.params
        const updatedItem = await UserItem.findByIdAndUpdate(itemId, req.body, { new: true });
        if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json(updatedItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete an item
const deleteItem = async (req, res) => {
    try {
        const {itemId}=req.params;
        const deletedItem = await UserItem.findByIdAndDelete(itemId);
        if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getUserItemsByRoom,
    createItem,
    getItemById,
    updateItem,
    deleteItem,
    createBulkItem
};
