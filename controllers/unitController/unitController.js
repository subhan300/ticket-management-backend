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


const geUnitsByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.params;
   
    const unit = await Unit.find({company: companyId},{name:1})
    res.status(200).json(unit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const geUnitRoomsByCompanyId = async (req, res) => {
    try {
      const { unitId } = req.params;
      console.log(unitId)
      const unit = await Unit.findById(unitId)
      res.status(200).json(unit);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };





module.exports={
    geUnitRoomsByCompanyId,
    getAllUnits,
    geUnitsByCompanyId
}