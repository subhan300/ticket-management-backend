const express = require("express");
const router = express.Router();
const {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getRoomBySku,createRoomsInBulk,
  deleteRoomsInBulk,
  getRoomsByUnitId
} = require("../controllers/roomController/roomController");

// Route to create a new room
router.post("/", createRoom);
router.post("/create-inbulk", createRoomsInBulk);

router.get("/", getAllRooms);
router.get("/unit/:unitId", getRoomsByUnitId);
router.get("/id/:id", getRoomById);
router.get("/:SKU", getRoomBySku);

router.put("/:id", updateRoom);

router.delete("/:id", deleteRoom);
router.delete("/inbulk/:unitId", deleteRoomsInBulk);

module.exports = router;
