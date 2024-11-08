const Ticket = require('../../models/ticketModel');
const LaundryTicket = require('../../models/laundryModel');
const Inventory = require('../../models/inventoryModel');
const userModel = require('../../models/userModel');
const { MANAGER, TECHNICIAN, USER, LAUNDRY_STATUS, OPEN, PROGRESS, CLOSED, COMPLETED } = require('../../utils/constants');
const dayjs = require('dayjs');
const { default: mongoose } = require('mongoose');

  
  const getTicketAnalytics = async (req, res) => {
    try {
      const { roles:userRoles, id } = req.user; // Extract user roles and ID from request
      const { startDate, endDate } = req.query;
      const roles=req?.body?.length ? req.body : userRoles
      const baseFilter = startDate && endDate 
        ? { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } }
        : {};
      
      let roleFilter = {};
      
      if (Array.isArray(roles)) {
        if (roles.includes(TECHNICIAN)) {
          roleFilter = { assignedTo: id }; 
        } else if (roles.includes(USER)) {
          roleFilter = { userId: id }; 
        }
      }
      
      // Combine filters
      const filter = { ...baseFilter, ...roleFilter };
      //  console.log("filter===",filter)
      const totalTickets = await Ticket.countDocuments(filter);
      const openTickets = await Ticket.countDocuments({ ...filter, status: OPEN });
      const progressTickets = await Ticket.countDocuments({ ...filter, status:  PROGRESS });
      // const blockedTickets = await Ticket.countDocuments({ ...filter, status: 'BLOCKED' });
      const closedTickets = await Ticket.countDocuments({ ...filter, status: CLOSED });
      const completedTickets = await Ticket.countDocuments({ ...filter, status: COMPLETED});
      
      const auditTickets = await Ticket.countDocuments({ ...filter, audit: true});
      
      // Get ticket counts for the current and previous month
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
      // const getTicketsCountForMonth = async (startOfMonth, endOfMonth) => {
      //   return Ticket.countDocuments({
      //     createdAt: { $gte: new Date(startOfMonth), $lte: new Date(endOfMonth) },
      //     ...roleFilter, 
      //   });
      // };
  
      // const currentMonthCount = await getTicketsCountForMonth(currentMonthStart, currentMonthEnd);
      // const previousMonthCount = await getTicketsCountForMonth(previousMonthStart, previousMonthEnd);
  
      // let percentageIncrease = 0;
      // if (previousMonthCount > 0) {
      //   percentageIncrease = ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100;
      // }
  
     
  
      res.status(200).json({
        // total:`${totalTickets} Tickets`,
        total:totalTickets,  
        statusCounts: {
          total:totalTickets,  
          openTickets,
          progressTickets,
          closedTickets,
          completedTickets,
          auditTickets
        
        },
        percentageIncrease: 0
        // percentageIncrease.toFixed(2), // Return percentage increase rounded to 2 decimal places
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  const getTicketAnalyticsForChart = async (req, res) => {
    try {
      const { roles, id } = req.user;
      const dateArray = req.body;
      console.log("id===",id)
      
      // Helper function to get counts for date ranges
      const getCountsForDates = async () => {
        const counts = [];
        
        for (const { startDate, endDate } of dateArray) {
          // const startOfDay = new Date(startDate);
          const startOfDay = dayjs(startDate).startOf('day').toDate();
          const startOfNextDay = dayjs(startDate).add(1, 'day').startOf('day').toDate();

  
          const matchFilter =  {
            createdAt: {
            $gte: startOfDay,   // Start of today
            $lt: startOfNextDay // Start of tomorrow (exclusive)
        }
      }
  
          if (roles.includes(TECHNICIAN)) {
            matchFilter.assignedTo = id;
          } else if (roles.includes(USER)) {
            matchFilter.userId = new mongoose.Types.ObjectId(id);
          
          }
          // No additional filter for 'manager'
      // console.log("match filter",matchFilter)
    
          const result = await Ticket.aggregate([
            { $match: matchFilter },
            {
              $group: {
                _id: null,
                openCount: {
                  $sum: {
                    $cond: [{ $eq: ["$status", OPEN] }, 1, 0]
                  }
                },
                progressCount: {
                  $sum: {
                    $cond: [{ $eq: ["$status", PROGRESS] }, 1, 0]
                  }
                },
                completedCount: {
                  $sum: {
                    $cond: [{ $eq: ["$status", COMPLETED] }, 1, 0]
                  }
                },
                auditCount: {
                  $sum: {
                    $cond: [{ $eq: ["$audit", true] }, 1, 0]
                  }
                }
              }
            }
          ]);
  
          // Add result to counts array
          counts.push({
            startDate,
            endDate,
            openCount: result[0]?.openCount || 0,
            progressCount: result[0]?.progressCount || 0,
            completedCount: result[0]?.completedCount || 0,
            auditCount:result[0]?.auditCount || 0
          });
        }
  
        return counts;
      };
  
      // Get counts for each status
      const counts = await getCountsForDates();
  
      // Response
      res.status(200).json({
        statusCounts: counts
      });
  
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  const getLaundryTicketAnalytics = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const filter = startDate && endDate ? { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } : {};
      console.log("date===>",new Date("2024-11-06"));
      const date=new Date("2024-11-06")
     

      const totalLaundryTickets = await LaundryTicket.countDocuments(filter);
      const pickedUp = await LaundryTicket.countDocuments({ ...filter, status: LAUNDRY_STATUS.PICKED_UP });
      const dryingCompleted = await LaundryTicket.countDocuments({ ...filter, status: LAUNDRY_STATUS.DRYING_COMPLETED });
      const washCompleted = await LaundryTicket.countDocuments({ ...filter, status: LAUNDRY_STATUS.DRYING_COMPLETED });
      const delivered = await LaundryTicket.countDocuments({ ...filter, status: LAUNDRY_STATUS.DELIVERED_TO_RESIDENT });
      const recieved = await LaundryTicket.countDocuments({ ...filter, status: LAUNDRY_STATUS.RECEIVED_IN_FACILITY});
  
   
      res.status(200).json({
        total:totalLaundryTickets,
        statusCounts: {
          total:totalLaundryTickets,
          pickedUp,
          recieved,
          washCompleted,
          dryingCompleted ,
          delivered,
   
        },
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
      const outOfStock = await Inventory.countDocuments({ ...filter, status: 'Out of Stock' });
      const inStock = await Inventory.countDocuments({ ...filter, status: 'In Stock' });
     
      const lowStock = await Inventory.countDocuments({ ...filter, status: 'Low Stock' });
     
  
  
      res.status(200).json({
        // total:`${totalInventoryItems} Pieces`,
        total:totalInventoryItems,
        statusCounts: {
          total:totalInventoryItems,
          inStock,
          lowStock,
          outOfStock,
         
        },
        
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
const getUsersAnalytics = async (req, res) => {
    try {
      const totalUserItems = await userModel.countDocuments();
      const managers = await userModel.countDocuments({ roles: { $in: [MANAGER] }});
      const technicians = await userModel.countDocuments({ roles: { $in: [TECHNICIAN] }});
      const Nurse = await userModel.countDocuments({ roles: { $in: [USER] } });
  
      res.status(200).json({
        // total:`${totalUserItems} Employees`,
        total:totalUserItems,
        statusCounts: {
          total:totalUserItems,
          managers,
          technicians,
          Nurse
        }
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  const getLaundryTicketAnalyticsForChart = async (req, res) => {
    try {
      // Extract date ranges from the request body
      const dateArray = req.body;
      // console.log("------",dateArray)
      // Helper function to get counts for date ranges
      const getCountsForDates = async () => {
        const counts = [];
  
        for (const { startDate, endDate } of dateArray) {
          const startOfDay = new Date(startDate);
          const endOfDay = new Date(endDate);
  
          const result = await LaundryTicket.aggregate([
            { $match: { createdAt: { $gte: startOfDay, 
              // $lt: endOfDay 
            } } },
            {
              $group: {
                _id: null,
                deliveredCount: {
                  $sum: {
                    $cond: [{ $eq: ["$status", LAUNDRY_STATUS.DELIVERED_TO_RESIDENT] }, 1, 0]
                  }
                },
                washCompleted: {
                  $sum: {
                    $cond: [{ $eq: ["$status", LAUNDRY_STATUS.WASH_COMPLETED] }, 1, 0]
                  }
                },
                dryingCompleted: {
                  $sum: {
                    $cond: [{ $eq: ["$status", LAUNDRY_STATUS.DRYING_COMPLETED] }, 1, 0]
                  }
                },
                pickedUpCount: {
                  $sum: {
                    $cond: [{ $eq: ["$status", LAUNDRY_STATUS.PICKED_UP] }, 1, 0]
                  }
                },
                recievedCount: {
                  $sum: {
                    $cond: [{ $eq: ["$status", LAUNDRY_STATUS.RECEIVED_IN_FACILITY] }, 1, 0]
                  }
                }
              }
            }
          ]);
  
          // Add result to counts array
          counts.push({
            startDate,
            endDate,
            deliveredCount: result[0]?.deliveredCount || 0,
            inProgressCount: result[0]?.inProgressCount || 0,
            pickedUpCount: result[0]?.pickedUpCount || 0,
            dryingCompleted:result[0]?.dryingCompleted || 0,
            washCompleted:result[0]?.washCompleted || 0,
              recievedCount :result[0]?.recievedCount || 0
          });
        }
  
        return counts;
      };
  
      // Get counts for each status
      const counts = await getCountsForDates();
  
      // Response
      res.status(200).json({
        statusCounts: counts
      });
  
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  

module.exports = {
  getTicketAnalyticsForChart,
    getUsersAnalytics,
  getTicketAnalytics,
  getLaundryTicketAnalytics,
  getInventoryAnalytics,
  getLaundryTicketAnalyticsForChart
};
