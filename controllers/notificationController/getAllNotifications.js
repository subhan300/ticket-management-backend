const Notification = require("../../models/notificationModel");



const getAllNotifications=async (req, res) => {
    const { id:userId } = req.user;
    console.log(req.user)
    console.log("user",userId)
  
    try {
      const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

module.exports={getAllNotifications}