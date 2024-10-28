const Agenda = require("agenda");
const Job = require("../../jobs/jobs");
const dotenv = require("dotenv");

dotenv.config();
const databaseUrl=process.env.MONGODB_URI
console.log("dat base",databaseUrl)
const agenda = new Agenda({ db: { address: databaseUrl } });

Job(agenda);
agenda.start().then(() => {
    console.log('Agenda started');
  });
 const sheduleTicketCreation=async(req,res)=>{
  
        const { dateTime, data } = req.body;
      
        try {
          const job = await agenda.schedule(new Date(dateTime), 'my job', {
            data
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
