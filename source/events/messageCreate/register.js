const User = require("../../models/User.js");
const registerUser = require("../../utils/register-user");
const registerUserWithLanguage = require("../../utils/register-user");

module.exports = async (client, message) => {
  const isRegistered = await User.findOne({ "user.id": message.author.id });
  if (message.author.bot || isRegistered) return;

  const hasSpanishRole = message.member.roles.cache.has("1113259092077719562");

  if (hasSpanishRole) {
    await registerUserWithLanguage(message.author, client, "es-ES");
  } else {
    await registerUser(message.author, client);
  }
};
