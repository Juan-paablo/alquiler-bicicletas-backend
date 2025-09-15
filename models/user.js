const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: { type: String, required: true },
  },
  { timestamps: true, versionKey: false, collection: 'users' }
);

module.exports = mongoose.model('User', UserSchema);
