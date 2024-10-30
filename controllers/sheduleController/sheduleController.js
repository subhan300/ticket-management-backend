const Agenda = require("agenda");

const dotenv = require("dotenv");
const Ticket = require("../../models/ticketModel");
const { formatTicketNumber } = require("../../utils");
const dayjs = require("dayjs");

dotenv.config();
const databaseUrl=process.env.MONGODB_URI
const agenda = new Agenda({ db: { address: databaseUrl } });
const getLastTicketNumber = async () => {
  const lastTicket = await Ticket.findOne().sort({ ticketNo: -1 });
  const getNumber = lastTicket ? lastTicket.ticketNo : 0;
  return formatTicketNumber(getNumber);
};

agenda.start().then(() => {
    console.log('Agenda started');
  });
  

  const sheduleTicketCreation = async (req, res) => {
    const { companyId, name, email, id: userId,roles } = req.user;
    const { startDateTime, endDateTime, days, months, isOneTime, data } = req.body;
    const ticketNo = await getLastTicketNumber();
    const payload = { ...data, ticketNo, userId, companyId,isSheduled:true };
  
    try {
      if (!isOneTime) {
        const start = dayjs(startDateTime);
        const end = dayjs(endDateTime);
  
        const allowedDays = days.map(Number); // E.g., [1, 3, 5] for Monday, Wednesday, Friday
        const allowedMonths = months.map(Number); // E.g., [0, 6] for January and July
  
        let current = start;
        while (current.isBefore(end) || current.isSame(end)) {
          const currentDay = current.day(); // 0=Sunday, 1=Monday, ..., 6=Saturday
          const currentMonth = current.month(); // 0=January, ..., 11=December
  
        //   console.log(
        //     "__current day:", currentDay,
        //     "current month:", currentMonth,
        //     "__current datetime:", current.format()
        //   );
  
          // Check if the current date matches allowed days and months
          if (allowedDays.includes(currentDay) && allowedMonths.includes(currentMonth)) {
            await agenda.schedule(current.toDate(), 'create ticket', { data: payload,user:{roles,userId,name} });
            console.log(`Scheduled job on ${current.format()}`);
          }
  
          // Move to the start of the next day
          current = current.add(1, 'day').startOf('day');
        }
  
        res.send(`Jobs scheduled between ${startDateTime} and ${endDateTime} on specified days and months`);
      } else {
        const job = await agenda.schedule(dayjs(startDateTime).toDate(), 'create ticket', { data: payload ,user:{roles,userId,name}});
        res.send(`Single job scheduled with ID: ${job.attrs._id} for ${startDateTime}`);
      }
    } catch (error) {
      console.error('Error scheduling job:', error);
      res.status(500).send('Error scheduling job');
    }
  };
  

      
module.exports={
    sheduleTicketCreation,
    agenda
}
