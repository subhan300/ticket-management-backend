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
  updateTemperatureReadings,
  updateThreshold,
} = require("../controllers/recordTemepratureController/recordTemperatureController");

router.post("/", authenticateJWT, addTemperatureReading);
router.put("/", authenticateJWT, updateTemperatureReadings);
router.get("/get-all", authenticateJWT, getAllTemperatureReadings);
router.put("/threshold", authenticateJWT, updateThreshold);

module.exports = router;
