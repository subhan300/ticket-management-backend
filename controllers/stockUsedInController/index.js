const StockUsedIn = require('../../models/stockUsedInModel');
const StockItem=require("../../models/stockModel");
const { default: mongoose } = require('mongoose');
const { ObjectId } = require('mongoose').Types;
// Controller actions
const getAllUsageDetails = async (req, res) => {
  try {
    const usageDetails = await StockUsedIn.find();
    res.json(usageDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getUsageDetailsByCompany = async (req, res) => {
  const companyId = req.params.companyId;
  try {
    const usageDetails = await StockUsedIn.find({ companyId });
    res.json(usageDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
const createUsageDetail = async (req, res) => {
    const { stockItemId, companyId, location, additionalInformation, quantity, usedDate } = req.body;
  
    try {
        
        
      // Check if stock item exists and quantity is available
      const stockItem = await StockItem.findById(stockItemId);
      if (!stockItem) {
        return res.status(404).json({ message: 'Stock Item not found' });
      }
  
      if (stockItem.quantity < quantity) {
        return res.status(400).json({ message: 'Quantity not available' });
      }
  
      if (stockItem.status === 'outOfStock') {
        return res.status(400).json({ message: 'Stock Item is out of stock' });
      }
  
      // Create new usage detail
      const newUsageDetail = new StockUsedIn({
        stockItemId:new ObjectId(stockItemId),
        companyId:new ObjectId(companyId),
        location,
        additionalInformation,
        quantity,
        usedDate
      });
  
      // Save the new usage detail
      await newUsageDetail.save();
  
      // Optionally, you can update the stockItem quantity here if needed
      // Example: stockItem.quantity -= quantity;
      // await stockItem.save();
  
      res.status(201).json(newUsageDetail);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  };
  

module.exports={
    getUsageDetailsByCompany,
    getAllUsageDetails,
    createUsageDetail
}