const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// status check
app.get('/api/v1/status', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

// routes
app.use('/api/v1', require('./routes/index'));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// global error handler (must be last)
app.use(errorHandler);

module.exports = app;