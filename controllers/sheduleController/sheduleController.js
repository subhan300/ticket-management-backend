const Agenda = require("agenda");

const dotenv = require("dotenv");
const Ticket = require("../../models/ticketModel");
const { formatTicketNumber, ObjectId } = require("../../utils");
const dayjs = require("dayjs");
dotenv.config();
const databaseUrl = process.env.MONGODB_URI;
const agenda = new Agenda({ db: { address: databaseUrl } });
const recordTemperatureAgenda = new Agenda({ db: { address: databaseUrl, collection: 'temperatureJobs' } });

const getAllJobs = async (req, res) => {
  try {
    const jobs = await agenda.jobs({}); // Fetch all jobs
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Error fetching jobs" });
  }
};

const deleteJob = async (req, res) => {
  const { jobId } = req.params; // Get jobId from the request parameters

  try {
    const job = await agenda.cancel({ _id: new ObjectId(jobId) }); // Cancel the job by ID

    console.log("job", job, "jobId", jobId);
    if (job === 0) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ error: "Error deleting job" });
  }
};

agenda.start().then(() => {
  console.log("Agenda started");
});
recordTemperatureAgenda.start().then(() => {
    console.log("Record Temperature Agenda started");
  });

const sheduleTicketCreation = async (req, res) => {
  const { companyId, name, email, id: userId, roles } = req.user;
  const { startDateTime, endDateTime, days, months, isOneTime, data } =
    req.body;
  const payload = { ...data, userId, companyId, isScheduled: true };

  try {
    // Parse start and end dates
    const start = dayjs(startDateTime);
    const end = dayjs(endDateTime);

    // Extract time components from start date to maintain consistent time
    const startHour = start.hour();
    const startMinute = start.minute();
    const startSecond = start.second();

    if (isOneTime) {
      // For one-time jobs
      const job = await agenda.schedule(start.toDate(), "create ticket", {
        data: payload,
        user: { roles, userId, name },
      });
      return res
        .status(200)
        .json({ message: "One-time job scheduled successfully" });
    } else {
      const allowedDays = days.map(Number);
      const allowedMonths = months.map(Number);

      // Initialize current date with start date
      let current = start.clone();

      // Continue until we reach or exceed the end date
      while (current.isBefore(end) || current.isSame(end, "day")) {
        const currentDay = current.day();
        const currentMonth = current.month();

        if (
          allowedDays.includes(currentDay) &&
          allowedMonths.includes(currentMonth)
        ) {
          // Set the time to match the start time
          const scheduledTime = current
            .hour(startHour)
            .minute(startMinute)
            .second(startSecond);

          const job = await agenda.schedule(
            scheduledTime.toDate(),
            "create ticket",
            {
              data: payload,
              user: { roles, userId, name },
            }
          );

          console.log(
            `Scheduled job for ${scheduledTime.format(
              "DD/MM/YYYY HH:mm:ss"
            )} with ID: ${job.attrs._id}`
          );
        }

        // Move to the next day while preserving the original time
        current = current.add(1, "day");
      }

      return res.status(200).json({
        message: "Recurring jobs scheduled successfully",
        startTime: start.format("DD/MM/YYYY HH:mm:ss"),
        endTime: end.format("DD/MM/YYYY HH:mm:ss"),
      });
    }
  } catch (error) {
    console.error("Error scheduling job:", error);
    return res.status(500).json({
      error: "Error scheduling job",
      details: error.message,
    });
  }
};

const recordTemperature = async (req, res) => {
    const user=req.user
    await  recordTemperatureAgenda.start();
    await  recordTemperatureAgenda.every("0 8,14,20 * * *", "recordTemperature",{data:user});
    // await recordTemperatureAgenda.now("recordTemperature",{data:user});
    return res.status(200).send("record temperature job scheduled")
  };

module.exports = {
    recordTemperature,
  sheduleTicketCreation,
  agenda,
  getAllJobs,
  deleteJob,
  recordTemperatureAgenda
};
