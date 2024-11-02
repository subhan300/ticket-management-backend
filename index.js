const express = require("express");
const dotenv = require("dotenv");
const socketIo = require("socket.io");
const config = require("./config/default");
const companyRoute = require("./routes/companyRoute");
const userRoute = require("./routes/userRoute");
const testingRoute = require("./routes/testingRoute");
const unitRoute = require("./routes/unitRoute");
const ticketRoute = require("./routes/ticketRoute");
const commentRoute = require("./routes/commentRoute");
const inventoryRoute = require("./routes/inventoryRoute");
const notificationRoute = require("./routes/notificationRoute");
const productRoute = require("./routes/productRoute");
const locationRoute = require("./routes/locationRoute");
const userItemRoute = require("./routes/userItemRoute");
const laundryRoute = require("./routes/laundryRoute");
const analyticsRoute = require("./routes/analyticsRoute");
const roomsRoute = require("./routes/roomRoute");
const itemRoute = require("./routes/itemRoute");
const supplierRoute = require("./routes/supplierRoute");
const categoriesRoute = require("./routes/categoriesRoute");
const switchbotRoute = require("./routes/switchbotRoute");
const environmentCheckListRoute = require("./routes/environmentCheckListRoute");
const predefinedQuestionRoute = require("./routes/predefinedQuestionRoute");
const scheduleRoute = require("./routes/sheduleJobRoute");
const recordTemperatureRoute = require("./routes/recordTemperatureRoute");

const connectDB = require("./config/db");
const path = require("path");
const cors = require("cors");
const Ticket = require("./models/ticketModel");
const { generateQRCode, generateBarcode, generateSKU } = require("./utils");
const connectedUsers = require("./utils/store-data/connectedUsers");
const LaundryTicket = require("./models/laundryModel");
const {
  LaundryOperator,
  MANAGER,
  TECHNICIAN,
  USER,
} = require("./utils/constants");
const Notification = require("./models/notificationModel");
const { agenda } = require("./controllers/sheduleController/sheduleController");
const Job = require("./jobs/jobs");

dotenv.config();

const app = express();
const port = config.port;

// Middleware
app.use(express.json());
const corsOptions = {
  origin: "*", // allow all URLs
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // allow all methods\
  // allowedHeaders: [
  //   'Content-Type',
  // ],
};

app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, "public")));

// Example route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "other.html"));
});

// Health Check Route
app.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

// Connect to MongoDB
connectDB();

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// const io = socketIo(server);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for Socket.io
    methods: ["GET", "POST"],
  },
});

// Middleware to make io accessible in the controllers
app.use((req, res, next) => {
  req.io = io;
  Job(agenda, io);

  next();
});

// Routes
app.use("/api/users", userRoute);
app.use("/api/companies", companyRoute);
app.use("/api/testingRoute", testingRoute);
app.use("/api/ticket", ticketRoute);
app.use("/api/unit", unitRoute);
app.use("/api/comment", commentRoute);
app.use("/api/inventory", inventoryRoute);
app.use("/api/notification", notificationRoute);
app.use("/api/product", productRoute);
app.use("/api/location", locationRoute);
app.use("/api/userItems", userItemRoute);
app.use("/api/laundryTicket", laundryRoute);
app.use("/api/analytics", analyticsRoute);
app.use("/api/rooms", roomsRoute);
app.use("/api/item", itemRoute);
app.use("/api/supplier", supplierRoute);
app.use("/api/switchbot", switchbotRoute);
app.use("/api/categories", categoriesRoute);
app.use("/api/environmentCheckListRoute", environmentCheckListRoute);
app.use("/api/predefinedQuestionRoute", predefinedQuestionRoute);
app.use("/api/schedule", scheduleRoute);
app.use("/api/record-temperature", recordTemperatureRoute);


app.post("/api/genereate-barCode", async (req, res) => {
  const { text } = req.body;

  try {
    const barcodeRes = await generateBarcode(text);
    console.log("res", barcodeRes);
    console.log("res", barcodeRes);
    res.set("Content-Type", "image/png");
    res.status(200).send(barcodeRes);
  } catch (err) {
    console.error(err);
    res.status(400).json({ err });
  }
});
console.log("connected users collection", connectedUsers);
io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("joinTicketRoom", async (payload) => {
    const { ticketId, roles } = payload;
    console.log("joinTicketRoom", payload);
    console.log(`User joined room for ticket: ${ticketId}`);

    socket.join(ticketId);
    try {
      const ticket = await Ticket.findById(ticketId);
      const laundryTicket = await LaundryTicket.findById(ticketId);
      if (
        ticket &&
        (roles.includes(MANAGER) ||
          roles.includes(TECHNICIAN) ||
          roles.includes(USER))
      ) {
        socket.emit("initialComments", ticket.comments); // Emit the comments to the user
      }
      if (
        laundryTicket &&
        (roles.includes(MANAGER) || roles.includes(LaundryOperator))
      ) {
        socket.emit("initialComments", laundryTicket.comments); // Emit the comments to the user
      }
    } catch (err) {
      console.error("Error fetching ticket comments:", err);
      socket.emit("error", { message: "Error fetching ticket comments" });
    }
  });
  socket.on("leaveTicketRoom", (ticketId) => {
    console.log(`User left room for ticket: ${ticketId}`);
    socket.leave(ticketId);
  });
  socket.on("register", async (userId) => {
    connectedUsers[userId] = socket.id;

    try {
      // Loop through each connected user and send notifications specific to that user
      await Promise.all(
        Object.keys(connectedUsers).map(async (user) => {
          const socketId = connectedUsers[user];

          // Fetch notifications specific to this user
          const userNotifications = await Notification.find({ userId: user });
          console.log(
            `Fetched notifications for user ${user}:`,
            userNotifications
          );

          // Send the notifications only to the connected socket of that user
          io.to(socketId).emit("initialNotifications", userNotifications);
        })
      );
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }

    console.log(`User registered: ${userId}`);
    console.log("Connected users:", connectedUsers);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    for (const [userId, socketId] of Object.entries(connectedUsers)) {
      if (socketId === socket.id) {
        delete connectedUsers[userId];
        break;
      }
    }
  });
});
