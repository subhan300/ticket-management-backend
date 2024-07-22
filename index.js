const express = require('express');
const dotenv = require('dotenv');
const socketIo = require('socket.io');
const config = require('./config/default');
const companyRoute = require("./routes/companyRoute");
const userRoute = require('./routes/userRoute');
const stockItemRoute = require("./routes/stockItemsRoute");
const testingRoute = require("./routes/testingRoute");
const unitRoute = require("./routes/unitRoute");
const stockUsedInRoute = require("./routes/stockUsedInRoute");
const ticketRoute = require("./routes/ticketRoute");
const commentRoute = require("./routes/commentRoute");
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
app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

// Connect to MongoDB
connectDB();

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// const io = socketIo(server);
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins for Socket.io
    methods: ['GET', 'POST'],
  }
});


// Middleware to make io accessible in the controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/users', userRoute);
app.use('/api/companies', companyRoute);
app.use('/api/stockItems', stockItemRoute);
app.use('/api/testingRoute', testingRoute);
app.use('/api/stockUsedInRoute', stockUsedInRoute);
app.use('/api/ticket', ticketRoute);
app.use('/api/unit', unitRoute);
app.use('/api/comment', commentRoute);

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('joinTicketRoom', (ticketId) => {
    console.log(`User joined room for ticket: ${ticketId}`);
    socket.join(ticketId);
  });
  socket.on('leaveTicketRoom', (ticketId) => {
    console.log(`User left room for ticket: ${ticketId}`);
    socket.leave(ticketId);
});

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});
