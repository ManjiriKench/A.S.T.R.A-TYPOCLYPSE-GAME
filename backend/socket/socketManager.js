module.exports = (io, socket) => {
  socket.on('join-room', ({ roomCode, userId }) => {
    socket.join(roomCode);
    io.to(roomCode).emit('user-joined', { userId });
  });

  socket.on('progress-update', ({ roomCode, userId, progress }) => {
    io.to(roomCode).emit('update-progress', { userId, progress });
  });

  socket.on('disconnect', () => {
    console.log(`🚪 User disconnected: ${socket.id}`);
  });
};
