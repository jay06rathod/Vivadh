const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const debateRoutes = require('./routes/debateRoutes');  // ← moved to top

connectDB();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://vivadh-sandy.vercel.app/'  // ← add this
  ],
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => res.send("The Server is running!"));
app.use('/api/auth', authRoutes);
app.use('/api/debate', debateRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));