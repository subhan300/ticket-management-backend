const Agenda = require("agenda");
const Job = require("../../jobs/jobs");
const dotenv = require("dotenv");
const Ticket = require("../../models/ticketModel");
const { formatTicketNumber } = require("../../utils");

dotenv.config();
const databaseUrl=process.env.MONGODB_URI
console.log("dat base",databaseUrl)
const agenda = new Agenda({ db: { address: databaseUrl } });
const getLastTicketNumber = async () => {
  const lastTicket = await Ticket.findOne().sort({ ticketNo: -1 });
  const getNumber = lastTicket ? lastTicket.ticketNo : 0;
  return formatTicketNumber(getNumber);
};

Job(agenda);
agenda.start().then(() => {
    console.log('Agenda started');
  });
 const sheduleTicketCreation=async(req,res)=>{
    const { companyId, name, email, id: userId } = req.user;
        const { dateTime, data } = req.body;
        const ticketNo = await getLastTicketNumber();

        const payload={...data,ticketNo,userId,companyId,ticketNo}
      
        try {
          const job = await agenda.schedule(new Date(dateTime), 'create ticket', {
            data:payload
          });
          res.send(`Job scheduled with ID: ${job.attrs._id} for ${dateTime}`);
        } catch (error) {
          console.error('Error scheduling job:', error);
          res.status(500).send('Error scheduling job');
        }
      }


      
module.exports={
    sheduleTicketCreation
}
