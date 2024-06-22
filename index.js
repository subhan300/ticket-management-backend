const express = require('express');
const dotenv = require('dotenv');
const config = require('./config/default');
const companyRoute = require("./routes/companyRoute");
const userRoute = require('./routes/userRoute');
const stockItemRoute = require("./routes/stockItemsRoute");
const testingRoute = require("./routes/testingRoute");
const stockUsedInRoute = require("./routes/stockUsedInRoute");
const ticketRoute = require("./routes/ticketRoute");
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const port = config.port;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.static('public'));
// Health Check Route
app.get('/', (req, res) => {
  res.json({ status: 'UP' });
});

// Routes
app.use('/api/users', userRoute);
app.use('/api/companies', companyRoute);
app.use('/api/stockItems', stockItemRoute);
app.use('/api/testingRoute', testingRoute);
app.use('/api/stockUsedInRoute', stockUsedInRoute);
app.use('/api/ticket', ticketRoute);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
