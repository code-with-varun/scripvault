// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection

mongoose.connect(process.env.MONGO_URI)
.then(
() => {
    console.log("connected to database.")
},
(err) => {
    console.log("somthing went wrong :"+err)
}

)

// Routes
app.use('/auth', authRoutes);



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



