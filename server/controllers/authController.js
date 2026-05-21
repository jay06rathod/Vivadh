const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('../config/firebase');
const { sendOTPEmail } = require('../config/email');
const crypto = require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { email, name, uid } = decoded;

    // Look up by email OR firebaseUid
    let user = await User.findOne({ $or: [{ email }, { firebaseUid: uid }] });
    
    if (!user) {
      // Generate a unique username — append random suffix if name already taken
      let username = name || 'Vivadh User';
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        username = `${username}_${Math.random().toString(36).slice(2, 6)}`;
      }

      user = await User.create({
        username,
        email,
        firebaseUid: uid,
        password: require('crypto').randomUUID()
      });
    } else if (!user.firebaseUid) {
      // Link existing email/password account with Google
      user.firebaseUid = uid;
      await user.save();
    }

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      }
    });

  } catch (err) {
    console.error("Google Auth error:", err.code || err.message, err);
    res.status(401).json({ message: 'Invalid Firebase token' });
  }
};

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const userExist = await User.findOne({ email });
        if (userExist) return res.status(400).json({ message: "Email already in use" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            otp,
            otpExpiry,
            isVerified: false
        });

        await sendOTPEmail(email, otp);

        res.status(201).json({ message: "OTP sent to your email", email });

    } catch (err) {
        console.error("Register error:", err.message);
        res.status(500).json({ message: `Error occurred: ${err.message}` });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        if (user.isVerified) return res.status(400).json({ message: "Email already verified" });

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        res.json({
            token: generateToken(user._id),
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
            }
        });

    } catch (err) {
        res.status(500).json({ message: `Error occurred: ${err.message}` });
    }
};

const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });
        if (user.isVerified) return res.status(400).json({ message: "Email already verified" });

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        await sendOTPEmail(email, otp);

        res.json({ message: "OTP resent successfully" });

    } catch (err) {
        res.status(500).json({ message: `Error occurred: ${err.message}` });
    }
};

const login = async (req,res) => {
    try{
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if(!user) return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({ message: "Invalid Password" });

        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email first" });
        }

        res.json({
            token: generateToken(user._id),
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
            }
        });
    } catch(err) {
        res.status(500).json({ message: `Error occured: ${err.message}`});
    }
};

module.exports = { register, login, googleAuth, verifyOTP, resendOTP };