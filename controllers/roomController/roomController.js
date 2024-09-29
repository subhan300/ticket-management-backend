const Room = require('../../models/roomModel'); // Adjust the path as necessary
const { generateSKU,covertId } = require('../../utils');

// Create a new room
const createRoom = async (req, res) => {
  try {
    const {locations}=req.user;
    const location=location[0]
    const { SKU, roomName, unit } = req.body;
    const newRoom = new Room({ SKU, roomName, unit });
    await newRoom.save();
    res.status(201).json({ message: 'Room created successfully', room: newRoom });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const createRoomsInBulk = async (req, res) => {
    try {
      const {locations}=req.user;
      const location=locations[0]
      const rooms = req.body; // Expecting an array of room objects
  
      if (!Array.isArray(rooms) || rooms.length === 0) {
        return res.status(400).json({ message: 'Invalid data format. Please provide an array of room objects.' });
      }
      console.log("location--->",location)
      // Ensure that each room object has SKU, roomName, and unit fields
      const validRooms = rooms.map(room => {
        const {  roomName, unit } = room;
        const SKU=generateSKU(`${roomName}-${unit}`);
        return { SKU, roomName, unit ,location};
      });
     
      // Insert rooms in bulk
      const createdRooms = await Room.insertMany(validRooms);
  
      res.status(201).json(createdRooms);
    } catch (error) {
      console.error('Error creating rooms in bulk:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
// Get all rooms
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('unit'); // Populate unit reference
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a single room by ID
const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id).populate('unit');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getRoomsByUnitId = async (req, res) => {
  try {
    const { unitId } = req.params;
    const room = await Room.find({unit:unitId}).populate('unit');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json(room );
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const getRoomsByLocationId = async (req, res) => {
  try {
    const { locationId } = req.params;
    const groupedRooms = await Room.aggregate([
      {
          $match: {
              location: covertId(locationId) // Match rooms for the specific location
          }
      },
      {
          $lookup: {
              from: 'units', // Assuming the collection name for units is 'units'
              localField: 'unit',
              foreignField: '_id',
              as: 'unitDetails' // The field to add the unit details
          }
      },
      {
          $unwind: '$unitDetails' // Unwind the array to get individual unit details
      },
      {
          $group: {
              _id: '$unitDetails._id', // Group by unit ID
              unit: { $first: '$unitDetails' }, // Get the unit details
              rooms: { $push: { _id: '$_id', SKU: '$SKU', roomName: '$roomName' } } // Push room details into an array
          }
      },
      {
          $project: {
              _id: 0, // Exclude the default _id field
              unit: 1,
              rooms: 1
          }
      },
      {
        $sort: { 'unit.name': 1 } // Sort by unit name in ascending order (A-Z)
      }
  ]);
  
  
    if (!groupedRooms) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json(groupedRooms );
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getRoomBySku = async (req, res) => {
    try {
      // const {locations}=req.user
      console.log("location>>",req.user)
      const { SKU} = req.params;
    
      const room = await Room.find({$or: [
        { SKU: SKU }, 
        { roomName: SKU }, 
      ],}).populate('unit');
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      res.status(200).json(room[0] );
    } catch (error) {
      console.error('Error fetching room:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

// Update a room by ID
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const updatedRoom = await Room.findByIdAndUpdate(id, payload, { new: true });
    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json( updatedRoom );
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a room by ID
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRoom = await Room.findByIdAndDelete(id);
    if (!deletedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const deleteRoomsInBulk = async (req, res) => {
    try {
      const { unitId } = req.params; // Extract location ID from request parameters
  
      if (!unitId) {
        return res.status(400).json({ message: 'Location ID is required' });
      }
  
      // Delete all units associated with the given location ID
      const result = await Room.deleteMany({ unit: unitId });
  
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'No units found for the provided location ID' });
      }
  
      res.status(200).json({ message: 'Units deleted successfully', deletedCount: result.deletedCount });
    } catch (error) {
      console.error('Error deleting units by location ID:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  const updateBulkRooms = async (req, res) => {
    try {
        const { locations } = req.user;
        // const location = locations[0]; 

        const updateItem = req.body; 
       
        const filter = {}; // An empty filter will update all documents

        const savedItems = await Room.updateMany(filter, { $set: updateItem });
        
        res.status(201).json(savedItems); // Send back the updated items
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
module.exports = {
  updateBulkRooms,
  getRoomsByUnitId,
    deleteRoomsInBulk,
    getRoomBySku,
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  createRoomsInBulk,
  getRoomsByLocationId
};
