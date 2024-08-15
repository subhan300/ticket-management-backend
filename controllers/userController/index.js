// userController.js

const bcrypt = require('bcrypt');
const User = require('../../models/userModel');
const jwt=require("jsonwebtoken");
const { RESIDENT } = require('../../utils/constants');
// Function to create a new user
const createUser = async (req, res) => {
    const { name, email, role, password, companyId, livingLocation, locationName } = req.body;
  
    try {
      // Check if user already exists
      if (await User.findOne({ email })) {
        return res.status(400).json({ message: 'User already exists with this email.' });
      }
  
      // Check if living location is valid for RESIDENT role
      if (role === 'RESIDENT' && (!livingLocation || !livingLocation.unit?._id)) {
        return res.status(400).json({ message: 'Enter Valid Living Location' });
      }
  
      // Check for duplicate living location for RESIDENT role
      if (role === 'RESIDENT' && await User.findOne({ 'livingLocation.unit._id': livingLocation.unit._id, 'livingLocation.room': livingLocation.room })) {
        return res.status(400).json({ message: 'Another resident is already assigned to this room.' });
      }
  
      // Hash password and create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, email, role, password: hashedPassword, livingLocation, locationName, companyId });
      const savedUser = await newUser.save();
  
      // Generate JWT token
      const token = jwt.sign({ user: { id: savedUser._id, email, name, role, livingLocation, locationName } }, process.env.JWT_SECRET);
  
      // Send back token and user details
      res.status(201).json({ user: savedUser, token });
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
        const {role,companyId,name, livingLocation,locationName ,}=user
        const token = jwt.sign(
            { user: { id: user._id, email ,role,companyId,name,  livingLocation,locationName ,} },
            process.env.JWT_SECRET,
            // { expiresIn: '1h' }
        );

        res.json({ token,...user.toObject() });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};


module.exports={
    login,createUser
}