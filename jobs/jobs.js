module.exports = function (agenda) {
    agenda.define("my job", async (job) => {
      const data = job.attrs.data;
      console.log("Job executed with data:", data);
      // Add your job logic here
    });
  };
  