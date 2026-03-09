// const express = require('express');
// const cors = require('cors');
// const authRouter = require('./routes/authRouter');
// const userAuth = require('./middleware/authMiddleware');
// const helmet = require('helmet');
// require('dotenv').config();
// const connectDB = require('./config/db');

// const app = express();

// app.use(cors());
// app.use(helmet());
// app.use(express.json());

// connectDB();

// app.get('/', (req, res) => {
//     res.send('Server is running!');  
// });

// app.use('/api/auth', authRouter);

// app.get('/api/protected', userAuth, (req, res) => {
//     res.json({ message: 'This is a protected route', user: req.user });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`App listening on port ${PORT}!`);
// }); 

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");
const protect = require("./middleware/authMiddleware");

const app = express();

app.use(
  cors({
    origin: "*"
  })
);

app.use(
  express.json({
    limit: "10mb"
  })
);

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/food", protect, foodRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});