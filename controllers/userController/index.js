// userController.js

const bcrypt = require('bcrypt');
const User = require('../../models/userModel');
const jwt=require("jsonwebtoken");
const { RESIDENT } = require('../../utils/constants');
// Function to create a new user
const createUser = async (req, res) => {
    const { name, email, role, password, companyId, livingLocation, locationName,locations,imageUrl
    } = req.body;
  
    try {
      // Check if user already exists
      if (await User.findOne({ email })) {
        return res.status(400).json({ message: 'User already exists with this email.' });
      }
  
      
  
     
  
      // Hash password and create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ imageUrl, name, email, role, password: hashedPassword, livingLocation, locationName, companyId,locations });
      const savedUser = await newUser.save();
      const getUser=await User.findById(savedUser._id).populate("companyId").populate("locations");
      // Generate JWT token
      const token = jwt.sign({ user: { id: savedUser._id, email, name, role, livingLocation, locationName,locations } }, process.env.JWT_SECRET);
      
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
        const {role,companyId,name, livingLocation,locationName ,locations}=user
        const token = jwt.sign(
            { user: { id: user._id, email ,role,companyId,name, locationName ,locations} },
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
  const { name, email, role, password, companyId, livingLocation, locationName,locations,imageUrl } = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, {
      name,
      email,
      role,
      password: password ? await bcrypt.hash(password, 10) : undefined,
      locationName,
      companyId,
      locations,
      imageUrl
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
    const {companyId,locations}=req.user;
// location[0] because laundary operator will have only one location 
   const usersCollection=  await User.find({
      // locations: locations[0], 
      role: role,            // Filters by the user's role
    }).select("name _id");
    return res.status(200).send(usersCollection)
  } catch (error) {
    console.error('Error fetching managers:', error);
    res.status(400).send("failed to handle query")
  }
};
const getUsers= async (req,res) => {

  try {
    const {role}=req.params
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
  try {
    const { userId } = req.params;
    const deletedItem = await User.findByIdAndDelete(userId);

    res.status(200).json("deleted");
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    login,createUser,deleteUser
}