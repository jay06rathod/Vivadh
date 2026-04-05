const jwt = require('jsonwebtoken');
const User = require('../models/User')

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET); // ADD THIS
    console.log("Token received:", !!token);                      // ADD THIS

    if (!token) return res.status(401).json({ message: 'Not Authorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    next();
  } catch (err) {
    console.error("Auth error:", err.message); // ADD THIS
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

module.exports = { protect };