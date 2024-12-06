const sendSocketNotification = (req, socketId, notifyRes) => {
  try {
    req.io.to(socketId).emit("ticket", notifyRes);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { sendSocketNotification };
