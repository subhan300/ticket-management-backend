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
  const getAllUsersCollectionByRole = async (req,res) => {

    try {
      const {role}=req.params;
      const {companyId}=req.user;
      const usersCollection = await userModel.find({ role, companyId }).select('_id name');
      return res.status(200).send(usersCollection)
    } catch (error) {
      console.error('Error fetching managers:', error);
      res.status(400).send("failed to handle query")
    }
  };


  module.exports={
    getAllUsersCollectionByRole,
    getAllUsersByRole ,
    getAllManagers
  }