const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: String,
  password: String,
  isGuest: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', UserSchema);
