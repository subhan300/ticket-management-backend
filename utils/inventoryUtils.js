const Inventory = require('../models/inventoryModel'); // Path to your Inventory model

const updateStockStatus = (inventoryItem) => {
  console.log("inventoryItem.usedItem",inventoryItem)
  const totalAvailableQty = inventoryItem.quantity - inventoryItem.usedItem ;
  const isQtyAvailableForInventoryUpdate=totalAvailableQty - inventoryItem.updatedQty
  console.log("availableQty________",isQtyAvailableForInventoryUpdate,"threshold",inventoryItem.threshold)
  if (isQtyAvailableForInventoryUpdate <= 0) {
    return {status:"Out of Stock",availableQty:isQtyAvailableForInventoryUpdate};
  } else if (isQtyAvailableForInventoryUpdate < inventoryItem.threshold) {
    return {status:"Low Stock",availableQty:isQtyAvailableForInventoryUpdate};
  } else {
    return {status:"In Stock",availableQty:isQtyAvailableForInventoryUpdate};
  }
};

module.exports = { updateStockStatus };
