const {
  getAllUsersByRole,
} = require("../controllers/globalController/GlobalController");
const Ticket = require("../models/ticketModel");
const RecordTemperature = require("../models/recordTemperatureModel");
const { MANAGER, TECHNICIAN, USER } = require("../utils/constants");

const {
  handleTicketNotification,
} = require("../controllers/notificationController/notificationHelper");
const { formatTicketNumber } = require("../utils");
const {
  handleSheduledTicketNotification,
} = require("../controllers/notificationController/handleSheduledTicketNotification");
const {
  getTemepratureFromSensor,
} = require("../controllers/switchbotController/SwitchBotController");
const {
  handleLowTemperatureNotification,
} = require("../controllers/notificationController/handleLowTemperatureNotification");
const getLastTicketNumber = async (location) => {
  const lastTicket = await Ticket.findOne({location}).sort({ ticketNo: -1 });
  const getNumber = lastTicket ? lastTicket.ticketNo : 0;
  return formatTicketNumber(getNumber);
};
module.exports = function (agenda, io) {
  agenda.define("create ticket", async (job) => {
    try {
      const { data } = job.attrs.data;
      const { user } = job.attrs.data;
      const { companyId,location } = data;
      const ticketNo = await getLastTicketNumber(location);
      const ticket = new Ticket({ ...data, ticketNo });
      await ticket.save();
      const technicians = await getAllUsersByRole(companyId, TECHNICIAN);
      const managers = await getAllUsersByRole(companyId, MANAGER);
      const req = { io, user };

      handleSheduledTicketNotification(req, managers, technicians, ticket);
    } catch (err) {
      console.log(err);
    }
  });
  agenda.define("recordTemperature", async (job) => {
    try {
        const { data } = job.attrs.data;
        const records = await RecordTemperature.find({location:{$in:data.locations}}).populate("roomId").populate("location");
        console.log("record temperature____ ",records[0].isSensorIntegrated)
       
        for (const record of records) {
            if (record.isSensorIntegrated) {
                const sensorStatus = await getTemepratureFromSensor(record.isSensorIntegrated);

                const nurses = await getAllUsersByRole(data.companyId, USER);
                const managers = await getAllUsersByRole(data.companyId, MANAGER);
                console.log("sensot sttaus",sensorStatus)
                if (sensorStatus && sensorStatus.temperature != null) {
                    const req = { io, user: data };
                    if (
                        record.temperatureThreshold <= sensorStatus.temperature ||
                        record.humidityThreshold <= sensorStatus.humidity
                    ) {
                        await handleLowTemperatureNotification(req, managers, nurses, {
                            humidityThreshold: record.humidityThreshold,
                            humidity: sensorStatus.humidity,
                            temperatureThreshold: record.temperatureThreshold,
                            temperature: sensorStatus.temperature,
                            room: record.roomId.roomName,
                            location: record.location

                        });
                    }

                    const newReading = {
                        temperature: sensorStatus.temperature,
                        humidity: sensorStatus.humidity,
                        date: new Date(),
                        battery: sensorStatus.battery,
                    };
                    record.readings.push(newReading);
                    await record.save();
                    console.log("Saved new reading for room:", record.roomId.roomName);
                }
            }
            record.readings.sort((a, b) => b.date - a.date);
        }

    } catch (err) {
        console.error("Error in recordTemperature job:", err);
    }

    // Add your job logic here
  });
};
