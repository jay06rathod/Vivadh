const jwt = require('jsonwebtoken');
const User = require('../models/User')

const protect = async (res, req, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if(!token) return res.status(401).json({ message: `Not Authorized` });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        next();
    } catch(err) {
        res.send(401).json({ message: `Token invalid or expired` });
    }
};

module.exports = { protect };