// Copyright 2024 Nether Host. All rights reserved.
// Unauthorized use, modification, or distribution of this code is prohibited.

const registerUser = require("../../utils/register-user.js");
const handleError = require("../../utils/handle-error.js");
const JSON5 = require("json5");
const fs = require("fs");
const config = JSON5.parse(
  fs.readFileSync("source/config/general.json5", "utf-8"),
);
const User = require("../../models/User.js");

module.exports = async (client, member) => {
  try {
    if (member.user.bot || (await userExists(member.user))) return;

    await registerUser(member.user, client);
  } catch (error) {
    handleError(error);
  }
};

async function userExists(user) {
  const userData = await User.findOne({ "user.id": user.id });
  if (userData) {
    return true;
  } else {
    return false;
  }
}
