const { default: mongoose } = require('mongoose');
const UserItem = require('../../models/userItemsModel');
const { generateSKU } = require('../../utils');
const { getItemsGroupedByRoom, getItemsGroupedByRoomForIds } = require('./getItemsGroupedByRoom');

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

        const itemsWithUser=req.body
        const addSkuInTtems=itemsWithUser.map(val=>({...val,SKU:generateSKU(`${val.itemName}-${val.category}`)}))
         await UserItem.insertMany(addSkuInTtems);
        const room=new mongoose.Types.ObjectId(itemsWithUser[0].room);
        const itemsGroupedByRoom = await getItemsGroupedByRoomForIds(room)
        res.status(201).json(itemsGroupedByRoom[0]);
    } catch (err) {
        console.log("err",err)
        res.status(500).json({ message: err.message });
    }
}
const updateBulkItem = async (req, res) => {
    try {
        const { locations } = req.user;
        // const location = locations[0]; 

        const updateItem = req.body; 
       
        const filter = {}; // An empty filter will update all documents

        const savedItems = await UserItem.updateMany(filter, { $set: updateItem });
        
        res.status(201).json(savedItems); // Send back the updated items
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


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

const getUserItems =  async (req, res) => {
    try {
        const { locations } = req.user;
        const location = locations[0]; 
        const locationObjectId = new mongoose.Types.ObjectId(location);
        
        const itemsGroupedByRoom = await getItemsGroupedByRoom(locationObjectId)
        console.log("itemsGroupedByRoom",itemsGroupedByRoom)
       
        res.status(200).json(itemsGroupedByRoom)
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

// Get a specific item
const getItemById = async (req, res) => {
    try {
        const {SKU}=req.params
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
        const room=new mongoose.Types.ObjectId(updatedItem.room);
        const itemsGroupedByRoom = await getItemsGroupedByRoomForIds(room)
        return  res.status(201).json(itemsGroupedByRoom[0]);
      
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
    getUserItems,
    createItem,
    getItemById,
    updateItem,
    deleteItem,
    createBulkItem,
    updateBulkItem
};
