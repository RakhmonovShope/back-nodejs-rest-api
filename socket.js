let io;

export default {
  init: httpServer => {
    io = require('socket.io')(httpServer);
    return io;
  },
  getIO: () => {
    if (!io) {
      throw Error('Socket.io not initialized');
    }

    return io;
  }
};
