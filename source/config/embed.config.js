const { EmbedBuilder } = require("discord.js");

module.exports = {
  error: function (e) {
    return new EmbedBuilder()
      .setTitle("Error")
      .setDescription(`An error has occurred. \n\n \`${e}\``)
      .setColor("Red");
  },
  warning: function (e) {
    return new EmbedBuilder()
      .setTitle("Warning")
      .setDescription(`${e}`)
      .setColor("Yellow");
  },
};
