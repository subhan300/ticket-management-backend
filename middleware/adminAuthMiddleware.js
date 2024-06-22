// authMiddleware.js

const jwt = require('jsonwebtoken');

// Middleware function to verify JWT token and check user role
const adminAuthenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Assuming Bearer token format

    if (!token) {
        return res.status(401).json({ message: 'Authentication failed. Token required.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token expired or invalid.' });
        }
        
        req.user = decoded.user; // Assuming your JWT payload includes a 'user' object

        // Check if user role is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized. Only admin can perform this action.' });
        }

        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = {
    adminAuthenticateJWT
};
