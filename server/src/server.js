const mongoose = require('mongoose');
const http = require('http');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const socket = require('./socket');

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.io
const io = require('socket.io')(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize socket handlers
const socketHandler = socket(io);

// Make socket handler available to the app
app.set('socketHandler', socketHandler);

// Exit handler
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

// Unexpected error handler
const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

// Connect to MongoDB
mongoose.connect(config.mongoose.url, config.mongoose.options)
  .then(() => {
    logger.info('Connected to MongoDB');
    
    // Start server
    server.listen(config.port, () => {
      logger.info(`Server listening on port ${config.port}`);
    });
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB', error);
    process.exit(1);
  });

// Handle unexpected errors
process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});