// userController.js

const bcrypt = require('bcrypt');
const User = require('../../models/userModel');
const jwt=require("jsonwebtoken");
const { RESIDENT } = require('../../utils/constants');
const Ticket = require('../../models/ticketModel');
const LaundryTicket = require('../../models/laundryModel');
const { default: mongoose } = require('mongoose');
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
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
    
        // Check password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT token
        const {role,companyId,name, livingLocation,locationName ,locations,roles}=user
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
    const {role}=req.params
// location[0] because laundary operator will have only one location 
   const usersCollection=  await User.find({
      // locations: locations[0], 
      roles: { $in: [role] },          // Filters by the user's role
    }).select("name _id");
    return res.status(200).send(usersCollection)
  } catch (error) {
    console.error('Error fetching managers:', error);
    res.status(400).send("failed to handle query")
  }
};
const getUsersByRoles= async (req,res) => {

  try {
    const {roles}=req.body
// location[0] because laundary operator will have only one location 
   const usersCollection=  await User.find({
      // locations: locations[0], 
      roles: { $in: roles },          // Filters by the user's role
    }).select("name _id");
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
      locations: locations[0], 
    }).populate("companyId").populate("locations");
    return res.status(200).send(usersCollection)
  } catch (error) {
    console.error('Error fetching managers:', error);
    res.status(400).send("failed to handle query")
  }
};

const deleteUser = async (req, res) => {
  const session = await mongoose.startSession(); // Start a new session for the transaction
  session.startTransaction(); // Start the transaction

  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Delete the user by its ID within the transaction
    const deletedUser = await User.findByIdAndDelete(userId, { session });

    if (!deletedUser) {
      await session.abortTransaction(); // Abort transaction if user is not found
      session.endSession();
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all tickets created by the user within the transaction
    const deletedTickets = await Ticket.deleteMany({  userId }, { session });
    const deletedLaundryTickets = await LaundryTicket.deleteMany({  userId }, { session });

    // Check if any tickets were deleted
    if (deletedTickets.deletedCount === 0) {
      console.log('No tickets found for the user');
    }
    if (deletedLaundryTickets.deletedCount === 0) {
      console.log('No tickets found for the user');
    }

    // Commit the transaction if everything goes well
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json("deleted");
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();
    console.error('Error deleting user by id:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteUsers = async (req, res) => {
  try {
    await Inventory.deleteMany({});

    res.status(200).json("deleted");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports={
  getUsers,
  getUsersByRole,
  updateUser,
    login,createUser,deleteUser,
    getUsersByRoles
}