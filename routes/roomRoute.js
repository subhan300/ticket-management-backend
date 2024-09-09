const express = require("express");
const router = express.Router();
const {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getRoomBySku,createRoomsInBulk,
  deleteRoomsInBulk
} = require("../controllers/roomController/roomController");

// Route to create a new room
router.post("/", createRoom);
router.post("/create-inbulk", createRoomsInBulk);

// Route to get all rooms
router.get("/", getAllRooms);

// Route to get a single room by ID
router.get("/id/:id", getRoomById);
router.get("/:SKU", getRoomBySku);

// Route to update a room by ID
router.put("/:id", updateRoom);

// Route to delete a room by ID
router.delete("/:id", deleteRoom);
router.delete("/inbulk/:unitId", deleteRoomsInBulk);

module.exports = router;
