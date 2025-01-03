const mongoose = require('mongoose');
const Unit = require('../../models/unitModel');
const User = require('../../models/userModel');
const { generateSKU } = require('../../utils');
const roomModel = require('../../models/roomModel');
const inventoryModel = require('../../models/inventoryModel');
const UserItem = require('../../models/userItemsModel');
const Ticket = require('../../models/ticketModel');
const LaundryTicket = require('../../models/laundryModel');

const getAllUnits = async (req, res) => {
  try {
    const units = await Unit.find({softDelete: { $ne: true }});
    res.status(200).json(units);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getUnitsByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.params;
    const {selectedLocation}=req.user
   
    const unit = await Unit.find({location: selectedLocation,softDelete: { $ne: true }},{name:1})
    res.status(200).json(unit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUnitsByLocationId = async (req, res) => {
  try {
    // const { locationId } = req.params;
    const {selectedLocation}=req.user
    const unit = await Unit.find({location:selectedLocation,softDelete: { $ne: true }})
    res.status(200).json(unit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUnitRoomsByCompanyId = async (req, res) => {
    try {
      const { unitId } = req.params;
      const unit = await Unit.findById(unitId)
      res.status(200).json(unit);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  const createUnit = async (req, res) => {
    try {
      const { name, rooms, location } = req.body;
      const newUnit = new Unit({
        name,
        rooms,
        location,
      });
      await newUnit.save();
      res.status(200).json({ message: 'Unit created successfully', unit: newUnit });
    } catch (error) {
      console.error('Error creating unit:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  const createUnitsInBulk = async (req, res) => {
    try {
      const units = req.body; 
      if (!Array.isArray(units)) {
        return res.status(400).json({ message: 'Invalid data format. Expected an array of units.' });
      }
      const createdUnits = await Unit.insertMany(units);
      res.status(200).json({ message: 'Units created successfully', units: createdUnits });
    } catch (error) {
      console.error('Error creating units in bulk:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  // Controller to update an existing unit
  const updateUnit = async (req, res) => {
    try {
      const { id } = req.params;
     
  
      // Find the unit by ID and update it
      const updatedUnit = await Unit.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );
  
      if (!updatedUnit) {
        return res.status(404).json({ message: 'Unit not found' });
      }
  
      // Respond with the updated unit
      res.status(200).json(updatedUnit );
    } catch (error) {
      console.error('Error updating unit:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  const deleteUnitsByLocation = async (req, res) => {
    try {
      const { locationId } = req.params; // Extract location ID from request parameters
  
      if (!locationId) {
        return res.status(400).json({ message: 'Location ID is required' });
      }
  
      // Delete all units associated with the given location ID
      const result = await Unit.deleteMany({ location: locationId });
  
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'No units found for the provided location ID' });
      }
  
      res.status(200).json({ message: 'Units deleted successfully', deletedCount: result.deletedCount });
    } catch (error) {
      console.error('Error deleting units by location ID:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // const deleteUnitById = async (req, res) => {
  //   const session = await mongoose.startSession(); // Start a new session for the transaction
  //   session.startTransaction(); // Start the transaction
  
  //   try {
  //     const { id } = req.params; // Extract the unit ID from request parameters
  
  //     if (!id) {
  //       return res.status(400).json({ message: 'Unit ID is required' });
  //     }
  
  //     // Delete the unit by its ID within the transaction
  //     const result = await Unit.findByIdAndUpdate(id, { softDelete: true }, { new: true });
  //     // const result = await Unit.findByIdAndDelete(id, { session });
  
  //     if (!result) {
  //       await session.abortTransaction(); // Abort transaction if unit is not found
  //       session.endSession();
  //       return res.status(404).json({ message: 'Unit not found' });
  //     }
  
  //     // Fetch all rooms associated with the unit before deleting them
  //     const roomsToDelete = await roomModel.find({ unit: id });
  
  //     if (!roomsToDelete.length) {
  //       await session.abortTransaction(); // Abort transaction if no rooms are found
  //       session.endSession();
  //       return res.status(404).json({ message: 'No rooms found associated with the unit' });
  //     }
  
  //     // Delete all rooms associated with the unit within the transaction
  //     const deleteRoomResult = await roomModel.deleteMany({ unit: id }, { session });
  
  //     if (!deleteRoomResult) {
  //       await session.abortTransaction(); // Abort transaction if room deletion fails
  //       session.endSession();
  //       return res.status(500).json({ message: 'Failed to delete associated rooms' });
  //     }
  
  //     // Delete associated data for each room (e.g., Inventory, UserItem, Tickets)
  //     const roomIds = roomsToDelete.map(room => room._id); // Collect all room IDs
  
  //     // Delete associated inventories, user items, and tickets for the rooms
  //     const res1 = await inventoryModel.deleteMany({ 'selectedRooms.room': { $in: roomIds } }, { session });
  //     const res2 = await UserItem.deleteMany({ room: { $in: roomIds } }, { session });
  //     const res3 = await Ticket.deleteMany({ room: { $in: roomIds } }, { session });
  //     const res4=await LaundryTicket.deleteMany({room:{ $in:roomIds }},{session});

  
  
  
  //     // Commit the transaction if everything goes well
  //     await session.commitTransaction();
  //     session.endSession();
  
  //     return res.status(200).json({ 
  //       message: 'Unit and associated rooms and their data deleted successfully', 
  //       unit: result 
  //     });
  //   } catch (error) {
  //     // Rollback the transaction on error
  //     await session.abortTransaction();
  //     session.endSession();
  //     console.error('Error deleting unit by id:', error);
  //     return res.status(500).json({ message: 'Internal server error' });
  //   }
  // };
  
  const deleteUnitById = async (req, res) => {
    const session = await mongoose.startSession(); // Start a new session for the transaction
    session.startTransaction(); // Start the transaction
    
    try {
      const { id } = req.params; // Extract the unit ID from request parameters
    
      if (!id) {
        return res.status(400).json({ message: 'Unit ID is required' });
      }
    
      // Soft delete the unit by its ID within the transaction
      const result = await Unit.findByIdAndUpdate(id, { softDelete: true }, { new: true, session });
    
      if (!result) {
        await session.abortTransaction(); // Abort transaction if unit is not found
        session.endSession();
        return res.status(404).json({ message: 'Unit not found' });
      }
    
      // Fetch all rooms associated with the unit before deleting them
      const roomsToDelete = await roomModel.find({ unit: id });
    
      if (!roomsToDelete.length) {
        await session.abortTransaction(); // Abort transaction if no rooms are found
        session.endSession();
        return res.status(404).json({ message: 'No rooms found associated with the unit' });
      }
    
      // Soft delete all rooms associated with the unit within the transaction
      const updateRoomsResult = await roomModel.updateMany(
        { unit: id },
        { softDelete: true },
        { session }
      );
    
      if (!updateRoomsResult) {
        await session.abortTransaction(); // Abort transaction if room update fails
        session.endSession();
        return res.status(500).json({ message: 'Failed to soft delete associated rooms' });
      }
    
     
    
      // Commit the transaction if everything goes well
      await session.commitTransaction();
      session.endSession();
    
      return res.status(200).json({
        message: 'Unit and associated rooms and their data marked as deleted successfully',
        unit: result
      });
    } catch (error) {
      // Rollback the transaction on error
      await session.abortTransaction();
      session.endSession();
      console.error('Error deleting unit by id:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  



const createUnitAndRooms = async (req, res) => {
  try {
    const { unitName, rooms,existingUnit,location } = req.body; // Expect unitName and an array of rooms in the request body
    const { locations } = req.user; // Assuming location comes from req.user
    // const location=locations[0]
    if (!rooms || !rooms.length) {
      return res.status(400).json({ message: "Unit name and rooms are required" });
    }
    let unit ;
   if(!existingUnit){
    unit = await Unit.findOne({ name: unitName });
    
    if (unit) {
      return res.status(400).json({ message: "Name Already Exist" });
    }
    unit = new Unit({
      name: unitName,
      location, 
    });
    await unit.save();
   }else{
    unit={_id:existingUnit}
   }
    
    const roomData = rooms.map(room => ({
      roomName: room,
      SKU: generateSKU(`${room}`),
      unit: unit._id, // Link the room to the unit
      location
    }));

    const createdRooms = await roomModel.insertMany(roomData); // Batch create rooms

    return res.status(201).json({
      message: "Unit and rooms created successfully",
      unit,
      rooms: createdRooms,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {  };


module.exports={ deleteUnitById, deleteUnitsByLocation,
  createUnitAndRooms,
  getUnitsByLocationId,
  getUnitRoomsByCompanyId,
  createUnitsInBulk,
  createUnit,
  updateUnit,
    getAllUnits,
    getUnitsByCompanyId
}