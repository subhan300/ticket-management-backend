const { ticketCreateMessage } = require("../../utils");
const {
  USER,
  MANAGER,
  maintenanceCategory,
  LOW_TEMPERATURE_CATEGORY,
} = require("../../utils/constants");
const connectedUsers = require("../../utils/store-data/connectedUsers");
const { createNotification } = require("./createNotification");
const { sendSocketNotification } = require("./sendSocketNotification");
const checkLowReadings = ({
  temperatureThreshold,
  humidityThreshold,
  temperature,
  humidity,
  room
}) => {
    console.log( temperatureThreshold,
        humidityThreshold,
        temperature,
        humidity,room)
  const lowReading = {
    temperatureLow: false,
    humidityLow: false,
    message: "",
  };

  if (temperature <= temperatureThreshold) {
    lowReading.temperatureLow = true;
  }
  if (humidity <= humidityThreshold) {
    lowReading.humidityLow = true;
  }

  if (lowReading.temperatureLow && lowReading.humidityLow) {
    lowReading.message = `Both temperature (${temperature}°C, threshold: ${temperatureThreshold}°C) and humidity (${humidity}%, threshold: ${humidityThreshold}%) are below their respective thresholds of Room ${room}`;
  } else if (lowReading.temperatureLow) {
    lowReading.message = `Temperature is below the threshold. Current temperature: ${temperature}°C, threshold: ${temperatureThreshold}°C  of Room ${room}`;
  } else if (lowReading.humidityLow) {
    lowReading.message = `Humidity is below the threshold. Current humidity: ${humidity}%, threshold: ${humidityThreshold}% of Room ${room}`;
  } else {
    lowReading.message = `Temperature (${temperature}°C) and humidity (${humidity}%) are within safe levels of Room ${room}`;
  }

  return lowReading;
};

const notifyUsers = async (req, data, usersCollection, message, category) => {
  
//   console.log("ticket====>", data);

  for (const userId of usersCollection) {
    
    const socketId = connectedUsers[userId];
    console.log("notify func run =====user====", userId,"scoket id",connectedUsers);
    const notifyRes = await createNotification(userId, message, null, category);
    sendSocketNotification(req, socketId, notifyRes);
  }
};

const  handleLowTemperatureNotification = async (
  req,
  managersCollection,
  roleBasedUserCollection,
  data
) => {
  const getLowReadingThings = checkLowReadings(data);

  console.log("data=======================>", data);
  await notifyUsers(
    req,
    data,
    roleBasedUserCollection,
    getLowReadingThings.message,
    LOW_TEMPERATURE_CATEGORY
  );
  await notifyUsers(
    req,
    data,
    managersCollection,
    getLowReadingThings.message,
    LOW_TEMPERATURE_CATEGORY
  );
};
module.exports = {  handleLowTemperatureNotification };
