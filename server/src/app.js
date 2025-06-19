const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/config');
const { errorHandler } = require('./middleware/error');
const routes = require('./routes');

// Initialize Express app
const app = express();

// Set security HTTP headers
app.use(helmet());

// Parse JSON request body
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize request data
app.use(xss());
app.use(mongoSanitize());

// Enable CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

// Parse cookies
app.use(cookieParser());

// Compress all responses
app.use(compression());

// Request logging in development
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// API routes
app.use('/api', routes);

// Serve static files in production
if (config.env === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send({ status: 'ok' });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Resource not found'
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;