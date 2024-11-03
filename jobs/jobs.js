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
const getLastTicketNumber = async () => {
  const lastTicket = await Ticket.findOne().sort({ ticketNo: -1 });
  const getNumber = lastTicket ? lastTicket.ticketNo : 0;
  return formatTicketNumber(getNumber);
};
module.exports = function (agenda, io) {
  agenda.define("create ticket", async (job) => {
    try {
      const { data } = job.attrs.data;
      const { user } = job.attrs.data;
      const { companyId } = data;
      const ticketNo = await getLastTicketNumber();
      const ticket = new Ticket({ ...data, ticketNo });
      await ticket.save();
      const technicians = await getAllUsersByRole(companyId, TECHNICIAN);
      const managers = await getAllUsersByRole(companyId, MANAGER);
      const req = { io, user };

      handleSheduledTicketNotification(req, managers, technicians, ticket);
      console.log("Ticket created successfully");
    } catch (err) {
      console.log(err);
    }
  });
  agenda.define("recordTemperature", async (job) => {
    try {
      // console.log("io===>",io)
      const { data } = job.attrs.data;
      // console.log("job===>",data)
      const records = await RecordTemperature.find({}).populate("roomId");
      // console.log("-started",records)
      for (const record of records) {
        if (record.isSensorIntegrated) {
          const sensorStatus = await getTemepratureFromSensor(
            record.isSensorIntegrated
          );
          const nurses = await getAllUsersByRole(data.companyId, USER);
          const managers = await getAllUsersByRole(data.companyId, MANAGER);

          if (sensorStatus && sensorStatus.temperature != null) {
            const req = { io, user: data };
            console.log("record=======>", sensorStatus);
            if (
              record.temperatureThreshold <= sensorStatus.temperature ||
              record.humidityThreshold <= sensorStatus.humidity
            )
              return handleLowTemperatureNotification(req, managers, nurses, {
                humidityThreshold: record.humidityThreshold,
                humidity: sensorStatus.humidity,
                temperatureThreshold: record.temperatureThreshold,
                temperature: sensorStatus.temperature,
                room:record.roomId.roomName
              });
            const newReading = {
              temperature: sensorStatus.temperature,
              humidity: sensorStatus.humidity,
              date: new Date(),
              battery: sensorStatus.battery,
            };
            record.readings.push(newReading);
            await record.save();
          }
        }
        record.readings.sort((a, b) => b.date - a.date);
      }

      console.log("tmeperature recording");
    } catch (err) {
      console.log(err);
    }
    // Add your job logic here
  });
};
