const mongoose = require('mongoose');

const Room = require('../models/Room');
const User = require('../models/User');

exports.createRoom = async (req, res) => {
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  try {
    const room = await Room.create({
      roomCode,
      users: [req.user.id],
      paragraph: "Sample paragraph for typing race."
    });
    res.json({ room });
  } catch (err) {
    res.status(500).json({ error: 'Room creation failed' });
  }
};

exports.joinRoom = async (req, res) => {
  const { roomCode } = req.body;
  try {
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const userId = req.user.id;

    // Prevent duplicate users
    if (!room.users.includes(userId)) {
      room.users.push(userId);
      await room.save();
    }

    res.json({ room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Join room error' });
  }
};