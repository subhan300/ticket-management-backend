
const userModel = require("../../models/userModel");
const getAllManagers = async (companyId) => {
  try {
    const managers = await userModel.find({
      roles: { $in: ['MANAGER'] },  // Use $in to check if 'MANAGER' is in the roles array
      companyId
    }).select('_id');
    return managers.map(manager => manager._id.toString());
  } catch (error) {
    console.error('Error fetching managers:', error);
    return [];
  }
};
const getAllUsersByRole = async (companyId, role) => {
  try {
    const usersCollection = await userModel.find({
      roles: { $in: [role] },  // Use $in to check if the single role exists in the roles array
      companyId
    }).select('_id');
    return usersCollection.map(user => user._id.toString());
  } catch (error) {
    console.error('Error fetching users by role:', error);
    return [];
  }
};

const getAllUsersCollectionByRole = async (req, res) => {
  try {
    const { companyId, role } = req.user;

    const usersCollection = await userModel.find({
      roles: { $in: [role] },  // Same modification here
      companyId
    }).select('_id name');
    
    return res.status(200).send(usersCollection);
  } catch (error) {
    console.error('Error fetching users by role:', error);
    res.status(400).send("Failed to handle query");
  }
};

module.exports = {
  getAllUsersCollectionByRole,
  getAllUsersByRole,
  getAllManagers
};
