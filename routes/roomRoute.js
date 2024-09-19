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
const { authenticateJWT } = require("../middleware/authMiddleware");

// Route to create a new room
router.post("/",authenticateJWT, createRoom);
router.post("/create-inbulk",authenticateJWT, createRoomsInBulk);

router.get("/",authenticateJWT, getAllRooms);
router.get("/unit/:unitId",authenticateJWT, getRoomsByUnitId);
router.get("/id/:id",authenticateJWT, getRoomById);
router.get("/:SKU",authenticateJWT, getRoomBySku);

router.put("/:id",authenticateJWT,updateRoom);

router.delete("/:id",authenticateJWT, deleteRoom);
router.delete("/inbulk/:unitId",authenticateJWT, deleteRoomsInBulk);

module.exports = router;
