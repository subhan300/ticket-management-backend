const {
  LaundryOperator,
  laundaryCategory,
  MANAGER,
} = require("../../utils/constants");
const { ticketCreateMessage } = require("../../utils/notificationMessages");
const { notifyUsers } = require("./notifyUser");

const handleLaundaryPrcoessNotification = async (req, users, ticket) => {
  const { managersCollection, laundryOperatorCollection } = users;
  const { roles, name } = req.user;
  if (roles.includes(MANAGER) && roleBasedUserCollection.length) {
    await notifyUsers(
      req,
      name,
      ticket,
      roleBasedUserCollection,
      ticketCreateMessage,
      laundaryCategory
    );
  }

  if (roles.includes(LaundryOperator)) {
    if (managersCollection.length)
      await notifyUsers(
        req,
        name,
        ticket,
        managersCollection,
        ticketCreateMessage,
        laundaryCategory
      );
  }
};
module.exports = { handleLaundaryPrcoessNotification };
