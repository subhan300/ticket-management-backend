const sendSocketNotification = (req, socketId, notifyRes) => {
  try {
    console.log("socket while sending id===", socketId);
    req.io.to(socketId).emit("ticket", notifyRes);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { sendSocketNotification };
