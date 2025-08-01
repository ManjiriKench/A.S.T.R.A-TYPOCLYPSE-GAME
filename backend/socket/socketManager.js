const Room = require('../models/Room');
const raceTimeouts = new Map(); // roomCode -> timeoutID

module.exports = (io, socket) => {
  socket.on('join-room', ({ roomCode, userId }) => {
    socket.join(roomCode);
    io.to(roomCode).emit('user-joined', { userId });
  });

  socket.on('progress-update', ({ roomCode, userId, progress }) => {
    io.to(roomCode).emit('update-progress', { userId, progress });
  });

  socket.on('start-game', async ({ roomCode }) => {
    try {
      const startTime = new Date();

      const room = await Room.findOneAndUpdate(
        { roomCode },
        { isStarted: true, startedAt: startTime },
        { new: true }
      );

      if (!room) return;

      // Optional countdown
      let countdown = 3;
      const countdownInterval = setInterval(() => {
        if (countdown > 0) {
          io.to(roomCode).emit('start-countdown', { countdown });
          countdown--;
        } else {
          clearInterval(countdownInterval);
          io.to(roomCode).emit('race-start', { paragraph: room.paragraph, startedAt: startTime });

          // Set race timeout (e.g., 60 seconds)
          const RACE_DURATION_MS = 60000;

          const timeout = setTimeout(async () => {
            try {
              const room = await Room.findOne({ roomCode });
              if (!room || room.isEnded) return;

              room.isEnded = true;
              await room.save();

              const results = room.finishedUsers
                .map(u => ({ user: u.user, wpm: u.wpm }))
                .sort((a, b) => b.wpm - a.wpm);

              io.to(roomCode).emit('race-ended', { results, timedOut: true });
              raceTimeouts.delete(roomCode);
            } catch (err) {
              console.error(`❌ Timeout race end failed:`, err);
            }
          }, RACE_DURATION_MS);

          // Store the timeout so it can be cleared if needed
          raceTimeouts.set(roomCode, timeout);

        }
      }, 1000);
    } catch (err) {
      console.error(`❌ Error starting game:`, err);
    }
  });


  socket.on('user-finished', async ({ roomCode, userId, wpm }) => {
    try {
    const finishedAt = new Date();

    const room = await Room.findOne({ roomCode });
    if (!room || room.isEnded) return;

    // Prevent duplicate finish entries
    const alreadyFinished = room.finishedUsers.some((entry) => entry.user.toString() === userId);
    if (alreadyFinished) return;

    // Add user to finishedUsers
    room.finishedUsers.push({ user: userId, wpm, finishedAt });
    await room.save();
    
    // Broadcast user finish
    io.to(roomCode).emit('user-finished', { userId, wpm });
    
    // Optional: End race when all users finish
    if (room.finishedUsers.length === room.users.length) {
      room.isEnded = true;
      await room.save();

      // Clear timeout to prevent double end
      if (raceTimeouts.has(roomCode)) {
        clearTimeout(raceTimeouts.get(roomCode));
        raceTimeouts.delete(roomCode);
      }
      
      // Sort results by WPM descending
      const results = room.finishedUsers
      .map((u) => ({ user: u.user, wpm: u.wpm }))
      .sort((a, b) => b.wpm - a.wpm);
      
      io.to(roomCode).emit('race-ended', { results });
    }
    
  } catch (err) {
    console.error(`❌ Error finishing race:`, err);
  }
});

socket.on('disconnect', () => {
  console.log(`🚪 User disconnected: ${socket.id}`);
});

};