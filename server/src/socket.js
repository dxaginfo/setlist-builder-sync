const jwt = require('jsonwebtoken');
const User = require('./models/user.model');
const config = require('./config/config');
const logger = require('./config/logger');

/**
 * Socket.io handler
 * @param {Object} io - Socket.io instance
 */
module.exports = function(io) {
  // Store active connections
  const connectedUsers = {};
  
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Find user by ID
      const user = await User.findById(decoded.sub);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    logger.info(`User connected: ${userId}`);
    
    // Store socket connection
    connectedUsers[userId] = socket.id;
    
    // Join personal room for direct messages
    socket.join(`user:${userId}`);
    
    // Join rooms for bands the user is in
    if (socket.user.bands && Array.isArray(socket.user.bands)) {
      socket.user.bands.forEach(band => {
        socket.join(`band:${band.toString()}`);
      });
    }

    // Event: Join a setlist room
    socket.on('join-setlist', (setlistId) => {
      logger.info(`User ${userId} joined setlist: ${setlistId}`);
      socket.join(`setlist:${setlistId}`);
    });

    // Event: Leave a setlist room
    socket.on('leave-setlist', (setlistId) => {
      logger.info(`User ${userId} left setlist: ${setlistId}`);
      socket.leave(`setlist:${setlistId}`);
    });

    // Event: Update setlist
    socket.on('update-setlist', (data) => {
      logger.info(`Setlist update by ${userId}:`, data.setlistId);
      // Broadcast to all users in the setlist room except sender
      socket.to(`setlist:${data.setlistId}`).emit('setlist-updated', {
        setlistId: data.setlistId,
        updatedBy: userId,
        changes: data.changes,
        timestamp: new Date()
      });
    });

    // Event: Update song
    socket.on('update-song', (data) => {
      logger.info(`Song update by ${userId}:`, data.songId);
      // Broadcast to all connected band members
      if (data.bandId) {
        socket.to(`band:${data.bandId}`).emit('song-updated', {
          songId: data.songId,
          updatedBy: userId,
          changes: data.changes,
          timestamp: new Date()
        });
      }
    });

    // Event: Disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${userId}`);
      delete connectedUsers[userId];
    });
  });

  // Expose methods to be used by the API
  return {
    // Send notification to a specific user
    sendToUser: (userId, event, data) => {
      const socketId = connectedUsers[userId];
      if (socketId) {
        io.to(socketId).emit(event, data);
        return true;
      }
      return false;
    },
    
    // Send notification to all members of a band
    sendToBand: (bandId, event, data) => {
      io.to(`band:${bandId}`).emit(event, data);
    },
    
    // Send notification to all users viewing a setlist
    sendToSetlist: (setlistId, event, data) => {
      io.to(`setlist:${setlistId}`).emit(event, data);
    },
    
    // Get all connected users
    getConnectedUsers: () => Object.keys(connectedUsers)
  };
};