const { getAllUsersByRole } = require("../controllers/globalController/GlobalController");
const Ticket = require("../models/ticketModel");
const { MANAGER, TECHNICIAN } = require("../utils/constants");
const {
    handleTicketNotification,
  } = require("../controllers/notificationController/notificationHelper");
const { formatTicketNumber } = require("../utils");

module.exports = function (agenda,req) {
    
  agenda.define("create ticket", async (job) => {
   try{
    const { data } = job.attrs.data;
    const { companyId, } = data;
    console.log("Creating ticket with data:", data);
    const ticket = new Ticket(data);
    await ticket.save();
    const technicians = await getAllUsersByRole(companyId, TECHNICIAN);
    const managers = await getAllUsersByRole(companyId, MANAGER);
    // handleTicketNotification(req, managers, technicians, ticket);
    await ticket.populate({
      path: "room",
      populate: {
        path: "unit",
        model: "Unit",
      },
    });

    console.log("Ticket created successfully");
   }catch(err){
    console.log(err);
   }
  });
  agenda.define("my job", async (job) => {
    const data = job.attrs.data;
    console.log("Job executed with data:", data);
    // Add your job logic here
  });
};
