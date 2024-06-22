// stockItemController.js

const StockItem = require('../../models/stockModel');
const createStockItem = async (req, res) => {
    const { name, price,quantity, purchaseDate, expiryDate, companyId ,status} = req.body;
   
    try {
        const newStockItem = new StockItem({
            name,
            price,
            purchaseDate,
            expiryDate,
            companyId,
            quantity,
            status

        });

        const savedStockItem = await newStockItem.save();
        res.status(201).json(savedStockItem);
    } catch (err) {
        console.error('Error creating stock item:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Function to get stock items by company ID
const getStockItemsByCompany = async (req, res) => {
    const { companyId } = req.params;

    try {
        const stockItems = await StockItem.find({ companyId });
        res.json(stockItems);
    } catch (err) {
        console.error('Error fetching stock items:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Other controller functions like createStockItem, getStockItemById, updateStockItem, deleteStockItem, etc.
module.exports={
    getStockItemsByCompany,
    createStockItem 
}