const Ticket = require('../../models/ticketModel');
const LaundryTicket = require('../../models/laundryModel');
const Inventory = require('../../models/inventoryModel');
const userModel = require('../../models/userModel');
const { MANAGER, TECHNICIAN, USER } = require('../../utils/constants');

const getDateRangeFilter = (date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
  
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
  
    return { $gte: startOfDay, $lte: endOfDay };
  };
  
  const getTicketAnalytics = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const filter = startDate && endDate ? { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } : {};
  
      const totalTickets = await Ticket.countDocuments(filter);
      const openTickets = await Ticket.countDocuments({ ...filter, status: 'OPEN' });
      const progressTickets = await Ticket.countDocuments({ ...filter, status: 'PROGRESS' });
      const blockedTickets = await Ticket.countDocuments({ ...filter, status: 'BLOCKED' });
      const closedTickets = await Ticket.countDocuments({ ...filter, status: 'CLOSED' });
      const completedTickets = await Ticket.countDocuments({ ...filter, status: 'COMPLETED' });
  
      const creationAnalytics = await Ticket.aggregate([
        {
          $match: filter,
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);
  
      res.status(200).json({
        totalTickets,
        statusCounts: {
          openTickets,
          progressTickets,
          blockedTickets,
          closedTickets,
          completedTickets,
        },
        creationAnalytics,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  const getLaundryTicketAnalytics = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const filter = startDate && endDate ? { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } : {};
  
      const totalLaundryTickets = await LaundryTicket.countDocuments(filter);
      const pickedUp = await LaundryTicket.countDocuments({ ...filter, status: 'PICKED_UP' });
      const inProgress = await LaundryTicket.countDocuments({ ...filter, status: 'IN_PROGRESS' });
      const delivered = await LaundryTicket.countDocuments({ ...filter, status: 'DELIVERED' });
  
      const creationAnalytics = await LaundryTicket.aggregate([
        {
          $match: filter,
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);
  
      res.status(200).json({
        totalLaundryTickets,
        statusCounts: {
          pickedUp,
          inProgress,
          delivered,
        },
        creationAnalytics,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  const getInventoryAnalytics = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const filter = startDate && endDate ? { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } : {};
  
      const totalInventoryItems = await Inventory.countDocuments(filter);
      const inStock = await Inventory.countDocuments({ ...filter, status: 'In Stock' });
      const outOfStock = await Inventory.countDocuments({ ...filter, status: 'Out of Stock' });
      const lowStock = await Inventory.countDocuments({ ...filter, status: 'Low Stock' });
  
      const creationAnalytics = await Inventory.aggregate([
        {
          $match: filter,
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);
  
      res.status(200).json({
        totalInventoryItems,
        statusCounts: {
          inStock,
          outOfStock,
          lowStock,
        },
        creationAnalytics,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
const getUsersAnalytics = async (req, res) => {
    try {
      const totalUserItems = await userModel.countDocuments();
      const managers = await userModel.countDocuments({ role: MANAGER });
      const technicians = await userModel.countDocuments({ role: TECHNICIAN});
      const users = await userModel.countDocuments({ role: USER });
  
      res.status(200).json({
        totalUserItems,
        statusCounts: {
          managers,
          technicians,
          users
        }
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

module.exports = {
    getUsersAnalytics,
  getTicketAnalytics,
  getLaundryTicketAnalytics,
  getInventoryAnalytics
};
