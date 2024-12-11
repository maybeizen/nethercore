// Copyright 2024 Nether Host. All rights reserved.
// Unauthorized use, modification, or distribution of this code is prohibited.

const Settings = require("../models/Settings.js");
const handleError = require("./handle-error.js");

async function getSettings(interaction) {
  try {
    let settings = await Settings.findOne({ guildId: interaction.guild.id });

    if (!settings) {
      settings = await createSettings(interaction);
    }

    return settings;
  } catch (error) {
    handleError(error, interaction);
    return null;
  }
}

async function createSettings(interaction) {
  try {
    const existingSettings = await Settings.findOne({
      guildId: interaction.guild.id,
    });
    if (existingSettings) {
      return existingSettings;
    }

    const settings = new Settings({
      guildId: interaction.guild.id,
    });
    await settings.save();
    return settings;
  } catch (error) {
    handleError(error, interaction);
    return null;
  }
}

module.exports = { getSettings };
