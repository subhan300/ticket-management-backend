// authMiddleware.js

const jwt = require('jsonwebtoken');

// Middleware function to verify JWT token
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Assuming Bearer token forma
    if (!token) {
        return res.status(401).json({ message: 'Authentication failed. Token required.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token expired or invalid.' });
        }
        req.user = decoded.user; // Assuming your JWT payload includes a 'user' object
        next();
    });
};

module.exports = {
    authenticateJWT
};
