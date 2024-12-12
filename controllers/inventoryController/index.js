// stockItemController.js

const Categories = require("../../models/categories");
const Inventory = require("../../models/inventoryModel");
const { updateStockStatus, generateSKU } = require("../../utils");
const { invenotryStatus } = require("../../utils/constants");
const populateInventory=async(item)=>{
  return await  item.populate({
     path: "inventoryUsed.room",
     select: "roomName ",
   })
   .populate("location").populate({
     path: 'selectedRooms.room', // Populate the 'room' field inside the array
     model: 'Room', // The model you're referencing
   }).populate("supplier")
 }
 
const handleSelectedRoomResSet=(val)=>{

  return val.selectedRooms.map(({room,id,quantity})=>{
    return {room:room._id,roomName:room.roomName,quantity}
  })

}
const createInventoryItem = async (req, res) => {
  const { companyId, name } = req.user;
  const {
    supplier,
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
    selectedRooms,
    customCategory,
    condition,
    expireDate,
    warranty,
    purchaseDate,
    threshold,
    warrantyPeriod
  } = req.body;
  let sku=SKU
  if(sku){
   const existingItem = await Inventory.findOne({ sku });
   if (existingItem) {
     return res.status(400).json({ error: 'SKU must be unique. This SKU already exists.' });
   }
  }else{
    sku=generateSKU(`${supplier}-${productName}`)
  }
   
  if(category==="Other"){
    const newCategory = new Categories({type:"inventory",category:customCategory,sizes:[size]});
    await newCategory.save()
    console.log("new cateogry====",newCategory)
  }
  try {
    const item = new Inventory({
      status:quantity < threshold? invenotryStatus.LOW_STOCK:invenotryStatus.IN_STOCK,
      supplier,
      warrantyPeriod,
      productName,
      productImage,
      description,
      selectedRooms,
      quantity,
      location,
      category:category==="Other"?customCategory:category,
      usedItem,
      companyId,
      SKU:sku,
      price,
      brand,
      modelNo,
      size,
      condition,
      expireDate,
      warranty,
      threshold,
      purchaseDate,
      receivingHistory: [
        {
          receivedDate: purchaseDate,
          receivedQty: quantity,
          receivedBy: name,
          price,
          warranty,
          selectedRooms,
        },
      ],
    });
    const savedItem = await item.save();

    const populatedItem =  Inventory.findById(savedItem._id)
    const invetoryPopulated=await populateInventory(populatedItem)
    const transFormInventory = {
      ...invetoryPopulated.toObject(),
       selectedRooms:handleSelectedRoomResSet(invetoryPopulated),
      inventoryId: invetoryPopulated._id,
    };
    res.status(201).json(transFormInventory);
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
    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

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
    const items = Inventory.findById(_id)
    const invetoryPopulated=await populateInventory(items)
    const transFormInventory = {
      ...invetoryPopulated.toObject(),
       selectedRooms:handleSelectedRoomResSet(invetoryPopulated),
      inventoryId: invetoryPopulated._id,
    };
    res.status(200).json(transFormInventory);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Failed to receive inventory", error });
  }
};

const updateInventoryItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const payload = req.body;
    const {customCategory,category,size}=req.body
    const item = await Inventory.findById(productId).lean();
    
    if (!item) return res.status(404).json({ error: "Item not found" });
    if(category && category==="Other"){
      const newCategory = new Categories({type:"inventory",category:customCategory,sizes:[size]});
      await newCategory.save()
    }
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
    const itemsUpdated =await Inventory.findByIdAndUpdate(productId, {...payload,category:category==="Other"?customCategory:category,}, {
      new: true,
    })
    console.log("itemsUpdated",itemsUpdated)
    const items = Inventory.findById(itemsUpdated._id)
    const invetoryPopulated=await populateInventory(items)
    const transFormInventory =  { ...invetoryPopulated.toObject(),
       selectedRooms:handleSelectedRoomResSet(invetoryPopulated),
      inventoryId: invetoryPopulated._id,
    }
    res.json(transFormInventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllItems = async (req, res) => {
  try {
    const items = await Inventory.find({softDelete: { $ne: true }})
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
    const items = await Inventory.findOne({ SKU ,softDelete: { $ne: true }})
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


const getInventoryItemsByCompany = async (req, res) => {
  const { companyId , selectedLocation} = req.user;

  try {
    const items =  Inventory.find({ location:{$in: selectedLocation},softDelete: { $ne: true } })
     const invetoryPopulated=await populateInventory(items)
     console.log("inventory",invetoryPopulated.map(val=>val.selectedRooms.map(item=>item.room)))
    const transFormInventory = invetoryPopulated.map((val) => ({
      ...val.toObject(),
       selectedRooms:handleSelectedRoomResSet(val),
      inventoryId: val._id,
    }));
    res.json(transFormInventory);
  } catch (err) {
    console.error("Error fetching inventory items:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
const getInventoryItemShortDetail = async (req, res) => {
  const {  selectedLocation} = req.user;

  try {
    const items = await Inventory.find({ location:{$in: selectedLocation} ,softDelete: { $ne: true }})
      .select("productName productImage")
      .lean();
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
const getInventoryItemsByLocation = async (req, res) => {
 
  const {id}=req.params

  try {
    const items =  Inventory.find({ location:id,softDelete: { $ne: true } })
     const invetoryPopulated=await populateInventory(items)
     console.log("inventory",invetoryPopulated.map(val=>val.selectedRooms.map(item=>item.room)))
    const transFormInventory = invetoryPopulated.map((val) => ({
      ...val.toObject(),
       selectedRooms:handleSelectedRoomResSet(val),
      inventoryId: val._id,
    }));
    res.json(transFormInventory);
  } catch (err) {
    console.error("Error fetching inventory items:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
const getInventoryItemShortDetailByLocation = async (req, res) => {

  const {id}=req.params

  try {
    const items = await Inventory.find({ location:id ,softDelete: { $ne: true }})
      .select("productName productImage")
      .lean();
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
    const deletedItem = await Inventory.findByIdAndUpdate(inventoryId, { softDelete: true }, { new: true });
    // Inventory.findByIdAndDelete(inventoryId);

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
  getInventoryItemShortDetailByLocation,
  getInventoryItemsByLocation,
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
