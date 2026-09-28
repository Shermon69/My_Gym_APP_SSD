const mongoose = require("mongoose");
const User = mongoose.model(
  "user",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    googleId: { type: String, default: null },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "role"
      }
    ]
  })
);
module.exports = User;