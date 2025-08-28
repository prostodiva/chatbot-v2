/**
 *
 * */

const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();

const { connectRedis } = require('./config/redis');

//import routes:
const authRoutes = require("./routes/auth");
const proxyRoutes = require("./routes/proxy");

const app = express();

//TO DO:
//connect to Redis
connectRedis();

//Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.use('/api/auth', authRoutes);
app.use('/api', proxyRoutes); // Proxy all other API calls

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

module.exports = app;