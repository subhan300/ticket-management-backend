
const Notification = require("../../models/notificationModel");


// GET all notifications by user ID
const getAllNotifications=async (req, res) => {
  const { id:userId } = req.user;

  try {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const updateNotification = async (req, res) => {
    const { notificationIds } = req.body;
    const { id: userId } = req.user;
  
    if (!Array.isArray(notificationIds)) {
      return res.status(400).json({ message: 'Invalid notificationIds array' });
    }
  
    try {
      await Notification.updateMany(
        { _id: { $in: notificationIds },userId },
        { $set: { isRead: false } }
      );
  
      res.status(200).json({ message: 'Notifications marked as read successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to mark notifications as read', error });
    }
  };
  
  // Controller to delete notifications
const deleteNotifications = async (req, res) => {
    const { notificationIds } = req.body;
    const { id: userId } = req.user;
  
    if (!Array.isArray(notificationIds)) {
      return res.status(400).json({ message: 'Invalid notificationIds array' });
    }
  
    try {
     const deleteRes=await await Notification.deleteMany({ _id: { $in: notificationIds } ,userId});
     console.log("delete res",deleteRes.deletedCount)

      res.status(200).json({ message: 'Notifications deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete notifications', error });
    }
  };
module.exports ={getAllNotifications,deleteNotifications,updateNotification}