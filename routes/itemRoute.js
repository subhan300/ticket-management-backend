const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController/itemController");

router.get("/", itemController.getAllItems);

router.post("/bulk", itemController.createItemsInBulk);

router.put("/:id", itemController.updateItemById);

router.delete("/:id", itemController.deleteItemById);
router.delete("/delete-duplicates/all", itemController.deleteDuplicates);

module.exports = router;
