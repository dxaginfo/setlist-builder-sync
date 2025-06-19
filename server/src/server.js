const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const logger = require('./config/logger');
const config = require('./config/config');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to MongoDB
mongoose.connect(config.mongoose.url, config.mongoose.options)
  .then(() => {
    logger.info('Connected to MongoDB');
    
    // Initialize socket connection
    require('./socket')(io);
    
    // Start the server
    server.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  })
  .catch((error) => {
    logger.error('Failed to connect to MongoDB', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  logger.info('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated!');
  });
});