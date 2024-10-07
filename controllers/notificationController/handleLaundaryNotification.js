const { LaundryOperator, laundaryCategory } = require("../../utils/constants");
const { ticketCreateMessage } = require("../../utils/notificationMessages");
const { notifyUsers } = require("./notifyUser");



const handleLaundaryTicketNotification = async (
  req,
  managersCollection,
  roleBasedUserCollection,
  ticket
) => {
  const { role, name } = req.user;
  if (role === "MANAGER" && roleBasedUserCollection.length) {
    console.log("collection of ", roleBasedUserCollection, "name", name);
    await notifyUsers(
      req,
      name,
      ticket,
      roleBasedUserCollection,
      ticketCreateMessage,laundaryCategory
    );
  }

  if (role === LaundryOperator) {
    if (managersCollection.length)
      await notifyUsers(
        req,
        name,
        ticket,
        managersCollection,
        ticketCreateMessage,laundaryCategory
      );
  }
};
module.exports = {  handleLaundaryTicketNotification };
