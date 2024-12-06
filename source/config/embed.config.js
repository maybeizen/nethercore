// Copyright 2024 Nether Host. All rights reserved.
// Unauthorized use, modification, or distribution of this code is prohibited.

const { EmbedBuilder } = require("discord.js");

module.exports = {
  error(e) {
    return new EmbedBuilder()
      .setTitle("Error")
      .setDescription(`An error has occurred. \n\n \`${e}\``)
      .setColor("Red");
  },
  warning(e) {
    return new EmbedBuilder()
      .setTitle("Warning")
      .setDescription(`${e}`)
      .setColor("Yellow");
  },
};
