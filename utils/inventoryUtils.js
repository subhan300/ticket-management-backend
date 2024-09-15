const Inventory = require('../models/inventoryModel'); // Path to your Inventory model

const updateStockStatus = (inventoryItem) => {
  const availableQty = inventoryItem.quantity - inventoryItem.usedItem ;
  if (availableQty <= 0) {
    return {status:"Out of Stock",availableQty};
  } else if (availableQty < inventoryItem.threshold) {
    return {status:"Low Stock",availableQty};
  } else {
    return {status:"In Stock",availableQty};
  }
};

module.exports = { updateStockStatus };
