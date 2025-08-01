const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },

  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // All users in room

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Host / creator

  isStarted: { type: Boolean, default: false }, // Has race started?

  startedAt: { type: Date }, // Timestamp when race started

  isEnded: { type: Boolean, default: false }, // Has race ended?

  paragraph: String, // Typing paragraph

  finishedUsers: [ // Race results
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      wpm: Number,
      finishedAt: Date
    }
  ]
});

// Optional performance indexes
// RoomSchema.index({ roomCode: 1 });
RoomSchema.index({ 'finishedUsers.user': 1 });

module.exports = mongoose.model('Room', RoomSchema);
