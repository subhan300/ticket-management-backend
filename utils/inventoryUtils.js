const Inventory = require('../models/inventoryModel'); // Path to your Inventory model

const updateStockStatus = (inventoryItem) => {
    console.log(">>>>>>>",inventoryItem)
  const availableQty = inventoryItem.quantity - inventoryItem.usedItem ;
  console.log(inventoryItem,"avaulable",availableQty,"inventoryItem.threshold",inventoryItem?.threshold)
  if (availableQty <= 0) {
    return {status:"Out of Stock",availableQty};
  } else if (availableQty < inventoryItem.threshold) {
    return {status:"Low Stock",availableQty};
  } else {
    return {status:"In Stock",availableQty};
  }
};

module.exports = { updateStockStatus };
