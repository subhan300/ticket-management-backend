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
  getRoomsByUnitId,getRoomsByLocationId,updateBulkRooms,getStorageRooms
} = require("../controllers/roomController/roomController");
const { authenticateJWT } = require("../middleware/authMiddleware");

// Route to create a new room
router.post("/",authenticateJWT, createRoom);
router.post("/create-inbulk",authenticateJWT, createRoomsInBulk);
router.put("/update-inbulk",authenticateJWT, updateBulkRooms);

router.get("/",authenticateJWT, getAllRooms);
router.get("/unit/:unitId",authenticateJWT, getRoomsByUnitId);
router.get("/location/:locationId",authenticateJWT, getRoomsByLocationId);
router.get("/storageRooms",authenticateJWT, getStorageRooms);
router.get("/id/:id",authenticateJWT, getRoomById);
router.get("/:SKU",authenticateJWT, getRoomBySku);

router.put("/:id",authenticateJWT,updateRoom);


router.delete("/:id",authenticateJWT, deleteRoom);
router.delete("/inbulk/:unitId",authenticateJWT, deleteRoomsInBulk);

module.exports = router;
