const mongoose = require('mongoose');
const Unit = require('../../models/unitModel');
const User = require('../../models/userModel');
const { ObjectId } = require('../../utils');

const getAllUnits = async (req, res) => {
  try {
    const units = await Unit.find();
    res.status(200).json(units);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getUnitsByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.params;
   
    const unit = await Unit.find({company: companyId},{name:1})
    res.status(200).json(unit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUnitsByLocationId = async (req, res) => {
  try {
    const { locationId } = req.params;
   
    const unit = await Unit.find({location:locationId})
    res.status(200).json(unit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUnitRoomsByCompanyId = async (req, res) => {
    try {
      const { unitId } = req.params;
      console.log(unitId)
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
      res.status(200).json({ message: 'Unit updated successfully', unit: updatedUnit });
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

module.exports={ deleteUnitsByLocation,
  getUnitsByLocationId,
  getUnitRoomsByCompanyId,
  createUnitsInBulk,
  createUnit,
  updateUnit,
    getAllUnits,
    getUnitsByCompanyId
}