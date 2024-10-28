// start-agendash.js
require('dotenv').config();
const { spawn } = require('child_process');

// Read the MongoDB URI from environment variables
const dbUri = process.env.MONGODB_URI;
const collection = 'agendaJobs';
const port = process.env.AGENDA_PORT || 3002;

// Start Agendash with the specified options
const agendash = spawn('npx', [
  'agendash',
  '--db', dbUri,
  '--collection', collection,
  '--port', port,
]);

agendash.stdout.on('data', (data) => {
  console.log(`Agendash output: ${data}`);
});

agendash.stderr.on('data', (data) => {
  console.error(`Agendash error: ${data}`);
});
