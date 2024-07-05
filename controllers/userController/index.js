// userController.js

const bcrypt = require('bcrypt');
const User = require('../../models/userModel');
const jwt=require("jsonwebtoken")
// Function to create a new user
createUser = async (req, res) => {
    const { name, email, role, password, companyId } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            role,
            password: hashedPassword,
            companyId // assuming companyId is provided when creating a user
        });

        const savedUser = await newUser.save();

        // Generate JWT token for the newly created user
        const token = jwt.sign(
            { user: { id: savedUser._id, email: savedUser.email, role: savedUser.role } },
            process.env.JWT_SECRET,
            // { expiresIn: '1h' }
        );

        // Send back the token along with user details
        res.status(201).json({ user: savedUser, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    console.log("email",email)

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
        const token = jwt.sign(
            { user: { id: user._id, email: user.email ,role:user.role} },
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