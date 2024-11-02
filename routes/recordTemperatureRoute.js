const express = require("express");
const router = express.Router();

const { authenticateJWT } = require("../middleware/authMiddleware");
const {
  sheduleTicketCreation,
  getAllJobs,
  deleteJob,
} = require("../controllers/sheduleController/sheduleController");
const {
  getAllTemperatureReadings,
  addTemperatureReading,
  getTemperatureReadings,
  getLatestTemperatureReading,
} = require("../controllers/recordTemepratureController/recordTemperatureController");

// getAllTemperatureReadings,
//   addTemperatureReading,
//   getTemperatureReadings,
//   getLatestTemperatureReading,
router.post("/", authenticateJWT, addTemperatureReading);

router.get("/room/:roomId", authenticateJWT, getTemperatureReadings);

router.get("/room/:roomId/latest", authenticateJWT, getLatestTemperatureReading);
router.get("/get-all", authenticateJWT, getAllTemperatureReadings);

module.exports = router;
