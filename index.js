const express = require('express');
const dotenv = require('dotenv');
const config = require('./config/default');
const companyRoute = require("./routes/companyRoute");
const userRoute = require('./routes/userRoute');
const stockItemRoute = require("./routes/stockItemsRoute");
const testingRoute = require("./routes/testingRoute");
const unitRoute = require("./routes/unitRoute");
const stockUsedInRoute = require("./routes/stockUsedInRoute");
const ticketRoute = require("./routes/ticketRoute");
const connectDB = require('./config/db');
const path = require('path'); 
const cors = require('cors');
dotenv.config();

const app = express();
const port = config.port;


// Middleware
app.use(express.json());
app.use(cors());
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Example route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'other.html'));
});
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
app.use('/api/unit', unitRoute);
connectDB();

app.listen(port, () => {
  
// Connect to MongoDB
  console.log(`Server is running on http://localhost:${port}`);
});
