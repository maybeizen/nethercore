// Copyright 2024 Nether Host. All rights reserved.
// Unauthorized use, modification, or distribution of this code is prohibited.

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const color = require("chalk");
const User = require("../../models/User.js");
const embed = require("../../config/embed.config.js");
const handleError = require("../../utils/handle-error.js");
const JSON5 = require("json5");
const fs = require("fs");
const { loadMessages, languageChoices } = require("../../utils/language.js");
const registerUser = require("../../utils/register-user.js");

const config = JSON5.parse(
  fs.readFileSync("source/config/general.json5", "utf-8"),
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("language")
    .setDescription("Choose the language that NetherCore will use.")
    .addStringOption((option) =>
      option
        .setName("language")
        .setDescription("Choose which language to use.")
        .setRequired(true)
        .addChoices(
          { name: "English (United States)", value: "en-US" },
          { name: "English (United Kingdom)", value: "en-GB" },
          { name: "Español", value: "es-ES" },
          { name: "العربية", value: "ar" },
          { name: "Hindi", value: "hi-IN" },
          { name: "Bahasa Indonesia", value: "id-ID" },
          { name: "Nederlands", value: "nl-NL" },
          { name: "Português", value: "pt-PT" },
          { name: "中文", value: "zh-CN" },
        ),
    ),

  async execute(interaction, client) {
    try {
      const language = interaction.options.getString("language");
      const messages = loadMessages(language);
      let user;

      user = await User.findOne({ "user.id": interaction.user.id });

      if (!user) {
        user = await registerUser(interaction.user, client);
      }

      user.language.value = language;
      await user.save();

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              messages.languageUpdatedTitle.replace(
                "{language}",
                languageChoices[language],
              ),
            )
            .setDescription(
              messages.languageUpdatedDescription
                .replace("{user}", interaction.user)
                .replace("{language}", languageChoices[language]),
            )
            .setColor(config.general.botColor)
            .setFooter({
              text: "Nether Host | nether.host",
              iconURL: client.user.displayAvatarURL({ dynamic: true }),
            }),
        ],
      });
    } catch (error) {
      handleError(error);
      await interaction.reply({
        embeds: [embed.error("Failed to register. Please try again later.")],
      });
    }
  },
};
