const { getAllUsersByRole } = require("../controllers/globalController/GlobalController");
const Ticket = require("../models/ticketModel");
const { MANAGER, TECHNICIAN } = require("../utils/constants");
const {
    handleTicketNotification,
  } = require("../controllers/notificationController/notificationHelper");
const { formatTicketNumber } = require("../utils");
const { handleSheduledTicketNotification } = require("../controllers/notificationController/handleSheduledTicketNotification");

module.exports = function (agenda,io) {
  agenda.define("create ticket", async (job) => {
   try{
    const { data } = job.attrs.data;
    const { user } =  job.attrs.data;
    const { companyId, } = data;
    console.log("Creating ticket with data:", user);
    const ticket = new Ticket(data);
    await ticket.save();
    const technicians = await getAllUsersByRole(companyId, TECHNICIAN);
    const managers = await getAllUsersByRole(companyId, MANAGER);
    const req={io,user}
   
    handleSheduledTicketNotification(req,managers,technicians,ticket)
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
