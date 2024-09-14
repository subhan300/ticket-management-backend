const OPEN = "OPEN";
const PROGRESS = "PROGRESS";
const CLOSED = "CLOSED";
const BLOCKED = "BLOCKED";
const COMPLETED = "COMPLETED";
const TECHNICIAN = "TECHNICIAN";
const USER = "USER";
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
const LAUNDRY_PRIORITY = {
  HIGH: "MEDIUM",
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
