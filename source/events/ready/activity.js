const { ActivityType } = require("discord.js");

module.exports = (client) => {
  client.user.setActivity({
    name: "nether.host",
    type: ActivityType.Watching,
  });
};
