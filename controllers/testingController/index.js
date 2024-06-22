// userController.js

const bcrypt = require('bcrypt');
// const User = require('../models');

// Function to create a new user
exports.testGet = async (req, res) => {
   
    
    try {
        
        res.status(200).json({message:"get api working"});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Other controller functions like getUserById, updateUser, deleteUser, etc.
