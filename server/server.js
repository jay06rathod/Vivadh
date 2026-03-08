const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

connectDB();

const app = express()
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/',(req,res) => {
    res.send("The Server is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));