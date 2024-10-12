const OPEN = "Open";
const PROGRESS = "In-Progress";
const CLOSED = "Closed";
const BLOCKED = "Blocked";
const COMPLETED = "Completed";
const TECHNICIAN = "TECHNICIAN";
const USER = "NURSE";
const HOUSEKEEPING = "HOUSEKEEPING";
const MANAGER = "MANAGER";
const ADMIN = "ADMIN";
const RESIDENT = "RESIDENT";
const NotAssigned = "Not Assigned";
const NotAssignedId = "NotAssigned";
const locationName1 = "Montabello";
const LaundryOperator = "LaundryOperator";
const HIGH = "HIGH";
const MEDIUM = "MEDIUM";
const LOW = "LOW";

 const laundaryCategory="laundary"
 const maintenanceCategory="tickets"
 const inventoryCategory="inventory"
const LAUNDRY_PRIORITY = {
  MEDIUM: "MEDIUM",
  LOW: "LOW",
  HIGH: "HIGH",
};
const LAUNDRY_STATUS = {
  
  PICKED_UP: "Picked up",
  RECEIVED_IN_FACILITY: "Received in Laundry facility",
  WASH_STARTED: "Wash started",
  WASH_COMPLETED: "Wash completed",
  DRYING_STARTED: "Drying started",
  DRYING_COMPLETED: "Drying completed",
  LAUNDRY_COMPLETED: "Laundry completed",
  DELIVERED_TO_RESIDENT: "Laundry delivered to resident",
  STREAM_PRESS:"Stream-Press",
  CLOSED: "Closed",
};

module.exports = {
  laundaryCategory,maintenanceCategory,inventoryCategory,
  LAUNDRY_PRIORITY,
  LAUNDRY_STATUS,
  HIGH,
  MEDIUM,
  LOW,
  LaundryOperator,
  locationName1,
  RESIDENT,
  NotAssignedId,
  NotAssigned,
  COMPLETED,
  OPEN,
  PROGRESS,
  BLOCKED,
  TECHNICIAN,
  HOUSEKEEPING,
  MANAGER,
  ADMIN,
  CLOSED,
  USER,
};
