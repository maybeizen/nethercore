// Copyright 2024 Nether Host. All rights reserved.
// Unauthorized use, modification, or distribution of this code is prohibited.

const User = require("../models/User");
const color = require("chalk");

async function updateLeftAt(user) {
  try {
    await User.findOneAndUpdate(
      { "user.id": user.id },
      { $set: { leftAt: new Date() } }
    );

    console.log(
      color.green("[INFO] ") +
        color.white(`${user.username} has left the server.`)
    );
  } catch (error) {
    handleError(error);
  }
}

module.exports = { updateLeftAt };