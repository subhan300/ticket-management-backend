// userController.js

const bcrypt = require('bcrypt');
const User = require('../../models/userModel');
const jwt=require("jsonwebtoken");
const { RESIDENT } = require('../../utils/constants');
const Ticket = require('../../models/ticketModel');
const LaundryTicket = require('../../models/laundryModel');
const { default: mongoose } = require('mongoose');
const locationModel = require('../../models/locationModel');
// Function to create a new user
const createUser = async (req, res) => {
    const { name, email, role, password, companyId, livingLocation, locationName,locations,imageUrl,roles
    } = req.body;
  
    try {
      // Check if user already exists
      if (await User.findOne({ email })) {
        return res.status(400).json({ message: 'User already exists with this email.' });
      }
  
      
  
     
  
      // Hash password and create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ roles,imageUrl, name, email, role, password: hashedPassword, livingLocation, locationName, companyId,locations });
      const savedUser = await newUser.save();
      const getUser=await User.findById(savedUser._id).populate("companyId").populate("locations");
      // Generate JWT token
      const token = jwt.sign({ user: { id: savedUser._id, email, name, role,roles, livingLocation, locationName,locations } }, process.env.JWT_SECRET);
      
      // Send back token and user details
      res.status(201).json(getUser);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email,  });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (user.softDelete) {
          return res.status(400).json({ message: 'User is deleted.' });
      }
      
      
        // Check password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT token
        const {role,companyId,name,locationName ,locations,roles}=user
        const token = jwt.sign(
            { user: { id: user._id, email ,role,roles,companyId,name, locationName ,locations} },
            process.env.JWT_SECRET,
            // { expiresIn: '1h' }
        );

        res.json({ token,...user.toObject() });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  // const { name, email, role, password, companyId, livingLocation, locationName,locations,imageUrl } = req.body;
  const payload=req.body

  try {
    const user = await User.findByIdAndUpdate(id, {
      ...payload,
      password: payload.password ? await bcrypt.hash(payload.password, 10) : undefined,
     
    }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
     const getUser=await User.findById(user._id).populate("companyId").populate("locations");
    res.status(200).json(getUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getUsersByRole= async (req,res) => {

  try {
    const {locations}=req.user
    const {role,}=req.params
    console.log("roles__",role,)
// location[0] because laundary operator will have only one location 
   const usersCollection=  await User.find({
      // locations: locations[0], 
      locations:{$in:locations},
      roles: { $in: [role] },    
      softDelete: { $ne: true }  
    }).select("name _id softDelete");
    return res.status(200).send(usersCollection)
  } catch (error) {
    console.error('Error fetching managers:', error);
    res.status(400).send("failed to handle query")
  }
};

const getUsersByRoles= async (req,res) => {

  try {
    const {locations}=req.user
    const roles=req.body
// location[0] because laundary operator will have only one location 
   const usersCollection=  await User.find({
 
      roles: { $in: roles },
   locations:{$in:locations} ,softDelete: { $ne: true }        // Filters by the user's role
    }).select("name _id softDelete roles locations");
    return res.status(200).send(usersCollection)
  } catch (error) {
    console.error('Error fetching managers:', error);
    res.status(400).send("failed to handle query")
  }
};
const getUsers= async (req,res) => {

  try {
    const {companyId,locations}=req.user;
// location[0] because laundary operator will have only one location 
   const usersCollection=  await User.find({
    locations:{$in:locations}, softDelete: { $ne: true } 
    }).populate("companyId");
    return res.status(200).send(usersCollection)
  } catch (error) {
    console.error('Error fetching managers:', error);
    res.status(400).send("failed to handle query")
  }
};



const deleteUser = async (req, res) => {

  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Delete the user by its ID within the transaction
    
    const deletedUser = await User.findByIdAndUpdate(userId, { softDelete: true }, { new: true });
   console.log("deletd",deletedUser )
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

  

    return res.status(200).json("deleted");
  } catch (error) {
  
    console.error('Error deleting user by id:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
const updateAll = async (req, res) => {
  try {
      const { locations } = req.user;
      
      // Validate input
      if (!locations || !Array.isArray(locations)) {
          return res.status(400).json({ error: "Invalid locations data" });
      }

      // Perform bulk update
      const result = await User.updateMany(
          { locations: { $in: locations } }, // Match users with IDs in the locations array
          { 
              $set: { 
                  "userSettings.selectedLocation": locations[0] 
              } 
          }
      );
console.log("====",result)
      res.status(200).json({
          message: "Users updated successfully",
          modifiedCount: result.modifiedCount,
          matchedCount: result.matchedCount
      });
  } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({ 
          error: "Failed to update users", 
          details: error.message 
      });
  }
};

module.exports={
  updateAll,
  getUsers,
  getUsersByRole,
  updateUser,
    login,createUser,deleteUser,
    getUsersByRoles
}