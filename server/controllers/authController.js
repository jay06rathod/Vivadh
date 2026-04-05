const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('../config/firebase');

const generateToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { email, name, uid } = decoded;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        username: name || 'Vivadh User',
        email,
        firebaseUid: uid,
        password: 'google-auth'
      });
    }

    res.json({ token: generateToken(user._id) });

  } catch (err) {
    res.status(401).json({ message: 'Invalid Firebase token' });
  }
};

const register = async (req,res) => {
    try {
        const {username, email, password } = req.body;

        const userExist = await User.findOne({ email });
        if (userExist) return res.status(400).json({message: "Email already in use"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ username, email, password: hashedPassword });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id)
        });
    } catch(err){
        res.status(500).json({ message: `Error occured: ${err.message}`});
    }
};

const login = async (req,res) => {
    try{
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if(!user) return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({ message: "Invalid Password" });

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id)
        });
    } catch(err) {
        res.status(500).json({ message: `Error occured: ${err.message}`});
    }
};

module.exports = { register, login, googleAuth };