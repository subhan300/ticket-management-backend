const Room = require('../../models/roomModel'); // Adjust the path as necessary
const { generateSKU } = require('../../utils');

// Create a new room
const createRoom = async (req, res) => {
  try {
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
      const rooms = req.body; // Expecting an array of room objects
  
      if (!Array.isArray(rooms) || rooms.length === 0) {
        return res.status(400).json({ message: 'Invalid data format. Please provide an array of room objects.' });
      }
  
      // Ensure that each room object has SKU, roomName, and unit fields
      const validRooms = rooms.map(room => {
        const {  roomName, unit } = room;
        const SKU=generateSKU(`${roomName}-${unit}`);
        return { SKU, roomName, unit };
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

const getRoomBySku = async (req, res) => {
    try {
      const { SKU} = req.params;
      const room = await Room.find({SKU}).populate('unit');
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
module.exports = {
  getRoomsByUnitId,
    deleteRoomsInBulk,
    getRoomBySku,
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  createRoomsInBulk
};
