const Temperature = require("../../models/recordTemperatureModel");

// Add a new temperature reading for a room
const addTemperatureReading = async (req, res) => {
  try {
    const { roomId, temperature } = req.body;
    const today = new Date().setHours(0, 0, 0, 0); // Start of today's date

    let tempRecord = await Temperature.findOne({ roomId });

    if (!tempRecord) {
      // If no temperature record exists for the room, create it
      tempRecord = await Temperature.create({
        roomId,
        readings: [{ date: today, temperature }],
      });
    } else {
      // Check if today's reading exists; if so, update it, else add new
      const existingReading = tempRecord.readings.find(
        (reading) => reading.date.getTime() === today
      );

      if (existingReading) {
        existingReading.temperature = temperature;
      } else {
        tempRecord.readings.push({ date: today, temperature });
      }

      await tempRecord.save();
    }

    res
      .status(201)
      .json({ message: "Temperature reading added", data: tempRecord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get temperature readings for a specific room
const getTemperatureReadings = async (req, res) => {
  try {
    const { roomId } = req.params;
    const tempRecord = await Temperature.findOne({ roomId });

    if (!tempRecord) {
      return res
        .status(404)
        .json({ message: "Temperature record not found for this room" });
    }

    res.status(200).json({ data: tempRecord.readings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get the latest temperature reading for a specific room
const getLatestTemperatureReading = async (req, res) => {
  try {
    const { roomId } = req.params;
    const tempRecord = await Temperature.findOne({ roomId });

    if (!tempRecord || tempRecord.readings.length === 0) {
      return res
        .status(404)
        .json({ message: "No temperature readings found for this room" });
    }

    const latestReading = tempRecord.readings[tempRecord.readings.length - 1];
    res.status(200).json({ data: latestReading });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllTemperatureReadings = async (req, res) => {
    try {
      const tempRecord = await Temperature.find({ });
     console.log("__temp",tempRecord)
      if (!tempRecord) {
        return res
          .status(404)
          .json({ message: "Temperature record not found for rooms" });
      }
  
      res.status(200).json(tempRecord);
    } catch (error) {
        console.log("error",error)
      res.status(500).json({ message: error.message });
    }
  };
module.exports = {
    getAllTemperatureReadings,
  addTemperatureReading,
  getTemperatureReadings,
  getLatestTemperatureReading,
};
