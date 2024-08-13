const express = require("express");
const dotenv = require("dotenv");
const socketIo = require("socket.io");
const config = require("./config/default");
const companyRoute = require("./routes/companyRoute");
const userRoute = require("./routes/userRoute");
const stockItemRoute = require("./routes/stockItemsRoute");
const testingRoute = require("./routes/testingRoute");
const unitRoute = require("./routes/unitRoute");
const stockUsedInRoute = require("./routes/stockUsedInRoute");
const ticketRoute = require("./routes/ticketRoute");
const commentRoute = require("./routes/commentRoute");
const inventoryRoute = require("./routes/inventoryRoute");
const notificationRoute = require("./routes/notificationRoute");
const productRoute = require("./routes/productRoute");
const locationRoute = require("./routes/locationRoute");

const connectDB = require("./config/db");
const path = require("path");
const cors = require("cors");
const Ticket = require("./models/ticketModel");
const { generateQRCode, generateBarcode } = require("./utils");
const connectedUsers = require("./utils/store-data/connectedUsers");

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

  next();
});

// Routes
app.use("/api/users", userRoute);
app.use("/api/companies", companyRoute);
app.use("/api/stockItems", stockItemRoute);
app.use("/api/testingRoute", testingRoute);
app.use("/api/stockUsedInRoute", stockUsedInRoute);
app.use("/api/ticket", ticketRoute);
app.use("/api/unit", unitRoute);
app.use("/api/comment", commentRoute);
app.use("/api/inventory", inventoryRoute);
app.use("/api/notification", notificationRoute);
app.use("/api/product", productRoute);
app.use("/api/location", locationRoute);
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
  socket.on("joinTicketRoom", async (ticketId) => {
    console.log(`User joined room for ticket: ${ticketId}`);

    socket.join(ticketId);
    try {
      const ticket = await Ticket.findById(ticketId);
      if (ticket) {
        socket.emit("initialComments", ticket.comments); // Emit the comments to the user
      } else {
        socket.emit("error", { message: "Ticket not found" });
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
  socket.on("register", (userId) => {
    connectedUsers[userId] = socket.id;
    console.log(`User registered: ${userId}`);
    console.log("connedted users", connectedUsers);
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
