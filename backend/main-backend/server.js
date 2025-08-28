require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
console.log('INTERNAL_JWT_SECRET loaded:', process.env.INTERNAL_JWT_SECRET ? 'YES' : 'NO');

// Import routes


// Initialize express
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes


// Error handling middleware


// 404 handler - only for unmatched routes


const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Main Backend running on port ${PORT}`);
});

module.exports = app;