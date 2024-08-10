const userModel = require("../../models/userModel");

const getAllManagers = async (companyId) => {
    try {
      const managers = await userModel.find({ role: 'MANAGER', companyId }).select('_id');
      return managers.map(manager => manager._id.toString());
    } catch (error) {
      console.error('Error fetching managers:', error);
      return [];
    }
  };
  // this one is dynamic ,delete above one after replaicng it with below 
  const getAllUsersByRole = async (companyId,role) => {
    try {
      const usersCollection = await userModel.find({ role, companyId }).select('_id');
      return usersCollection.map(user => user._id.toString());
    } catch (error) {
      console.error('Error fetching managers:', error);
      return [];
    }
  };


  module.exports={
    getAllUsersByRole ,
    getAllManagers
  }